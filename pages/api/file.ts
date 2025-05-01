// pages/api/file.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication using getServerSession instead of getSession
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { cat, slug } = req.query;
    
    // Validate parameters
    if (typeof cat !== 'string' || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Prevent path traversal attacks
    const safeCat = cat.replace(/\.\./g, '');
    const safeSlug = slug.replace(/\.\./g, '');
    
    const filePath = path.join(process.cwd(), 'texts', safeCat, `${safeSlug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    res.status(200).send(content);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}