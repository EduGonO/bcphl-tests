import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs'; import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  try {
    const { cat, slug, filename, data } = req.body as Record<string, string>;
    if (!cat || !slug || !filename || !data) return res.status(400).end();

    const safeCat  = cat.replace(/\.\./g, '');
    const safeSlug = slug.replace(/\.\./g, '');
    const safeName = filename.replace(/[/\\]/g, '_');

    const dir = path.join(process.cwd(), 'public', 'media', safeCat, safeSlug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, safeName), Buffer.from(data, 'base64'));

    res.status(200).json({ path: `/media/${safeCat}/${safeSlug}/${safeName}` });
  } catch (e) {
    console.error('upload-media:', e);
    res.status(500).end();
  }
}
