// pages/api/upload-media.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
// ← correct import:
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { cat, slug, filename, data } = req.body as {
      cat: string; slug: string; filename: string; data: string;
    };

    // sanitize…
    const safeCat = cat.replace(/\.\./g, '');
    const safeSlug = slug.replace(/\.\./g, '');
    const safeName = filename.replace(/[/\\]/g, '_');

    const uploadDir = path.join(process.cwd(), 'public', 'media', safeCat, safeSlug);
    fs.mkdirSync(uploadDir, { recursive: true });

    const buffer = Buffer.from(data, 'base64');
    const dest = path.join(uploadDir, safeName);
    fs.writeFileSync(dest, buffer);

    return res.status(200).json({ path: `/media/${safeCat}/${safeSlug}/${safeName}` });
  } catch (error) {
    console.error('upload-media error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
