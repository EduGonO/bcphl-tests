import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

// 1. bump body-parser limit to 10 MB
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // 2. auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  try {
    const { cat, slug, filename, data } = req.body as {
      cat: string; slug: string; filename: string; data: string;
    };

    // 3. quick validation
    if (![cat, slug, filename, data].every(v => typeof v === 'string'))
      return res.status(400).end();

    const safeCat  = cat.replace(/\.\./g, '');
    const safeSlug = slug.replace(/\.\./g, '');
    const safeName = filename.replace(/[/\\]/g, '_');

    const dir = path.join(process.cwd(), 'public', 'media', safeCat, safeSlug);
    fs.mkdirSync(dir, { recursive: true });

    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(path.join(dir, safeName), buffer);

    res.status(200).json({ path: `/media/${safeCat}/${safeSlug}/${safeName}` });
  } catch (err) {
    console.error('upload-media error:', err);
    res.status(500).end();
  }
}
