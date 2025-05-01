import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Check authentication
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cat, slug, body } = req.body;
    
    // Validate parameters
    if (typeof cat !== 'string' || typeof slug !== 'string' || typeof body !== 'string') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Prevent path traversal attacks
    const safeCat = cat.replace(/\.\./g, '');
    const safeSlug = slug.replace(/\.\./g, '');
    
    const dirPath = path.join(process.cwd(), 'texts', safeCat);
    const filePath = path.join(dirPath, `${safeSlug}.md`);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    fs.writeFileSync(filePath, body);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).end();
  }
}