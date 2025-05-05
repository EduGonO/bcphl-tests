// pages/api/upload-media.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cat, slug, filename, data } = req.body as {
    cat: string;
    slug: string;
    filename: string;
    data: string; // base64
  };

  // validate
  if (
    typeof cat !== 'string' ||
    typeof slug !== 'string' ||
    typeof filename !== 'string' ||
    typeof data !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  // sanitize
  const safeCat = cat.replace(/\.\./g, '');
  const safeSlug = slug.replace(/\.\./g, '');
  const safeName = filename.replace(/[/\\]/g, '_');

  // ensure folder exists
  const uploadDir = path.join(process.cwd(), 'public', 'media', safeCat, safeSlug);
  fs.mkdirSync(uploadDir, { recursive: true });

  // write file
  const buffer = Buffer.from(data, 'base64');
  const dest = path.join(uploadDir, safeName);
  fs.writeFileSync(dest, buffer);

  // public URL
  const publicPath = `/media/${safeCat}/${safeSlug}/${safeName}`;
  return res.status(200).json({ path: publicPath });
}
