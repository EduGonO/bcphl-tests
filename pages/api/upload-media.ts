import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable, { type Fields, type Files } from 'formidable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export const config = { api: { bodyParser: false } };

type ParsedUpload = {
  category: string;
  slug: string;
  filename: string;
  filePath: string;
};

const sanitizeSegment = (value: string) => value.replace(/\.\./g, '');
const sanitizeFilename = (value: string) => value.replace(/[/\\]/g, '_');

const coerceField = (fields: Fields, key: string): string | null => {
  const value = fields[key];
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first === undefined || first === null ? null : String(first);
  }
  return String(value);
};

const parseMultipart = async (req: NextApiRequest): Promise<ParsedUpload | null> => {
  const form = formidable({ maxFileSize: 20 * 1024 * 1024, multiples: false });

  const { fields, files } = await new Promise<{ fields: Fields; files: Files }>(
    (resolve, reject) => {
      form.parse(req, (error, parsedFields, parsedFiles) => {
        if (error) return reject(error);
        resolve({ fields: parsedFields, files: parsedFiles });
      });
    }
  );

  const category = coerceField(fields, 'cat');
  const slug = coerceField(fields, 'slug');
  const incomingFile = files.file;

  if (!category || !slug || !incomingFile) return null;

  const file = Array.isArray(incomingFile) ? incomingFile[0] : incomingFile;
  if (!file?.filepath || !file.originalFilename) return null;

  return {
    category,
    slug,
    filename: file.originalFilename,
    filePath: file.filepath,
  };
};

const parseJsonBase64 = async (req: NextApiRequest): Promise<ParsedUpload | null> => {
  try {
    const body = await new Promise<any>((resolve, reject) => {
      let data = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(data || '{}'));
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    });

    const { cat, slug, filename, data } = body as Record<string, string>;
    if (!cat || !slug || !filename || !data) return null;

    const normalized = data.includes(',') ? data.split(',').pop() || '' : data;

    const tempPath = path.join(process.cwd(), 'tmp-upload');
    fs.mkdirSync(tempPath, { recursive: true });
    const filePath = path.join(tempPath, `${Date.now()}_${Math.random().toString(36).slice(2)}`);
    fs.writeFileSync(filePath, Buffer.from(normalized, 'base64'));

    return { category: cat, slug, filename, filePath };
  } catch (error) {
    console.error('upload-media json parse:', error);
    return null;
  }
};

const moveUpload = (upload: ParsedUpload) => {
  const safeCat = sanitizeSegment(upload.category);
  const safeSlug = sanitizeSegment(upload.slug);
  const safeName = sanitizeFilename(upload.filename);

  const dir = path.join(process.cwd(), 'public', 'media', safeCat, safeSlug);
  fs.mkdirSync(dir, { recursive: true });
  const targetPath = path.join(dir, safeName);
  fs.copyFileSync(upload.filePath, targetPath);
  try {
    fs.rmSync(upload.filePath, { force: true });
  } catch (error) {
    console.error('upload-media cleanup:', error);
  }
  return `/media/${safeCat}/${safeSlug}/${safeName}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  try {
    const upload =
      req.headers['content-type']?.startsWith('multipart/form-data')
        ? await parseMultipart(req)
        : await parseJsonBase64(req);

    if (!upload) {
      return res.status(400).json({ error: 'Paramètres de fichier manquants.' });
    }

    const storedPath = moveUpload(upload);
    res.status(200).json({ path: storedPath });
  } catch (e) {
    console.error('upload-media:', e);
    res.status(500).end();
  }
}
