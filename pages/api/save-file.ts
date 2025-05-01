import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication using getServerSession instead of getSession
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.log('Save-file API: Unauthorized access attempt');
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
    console.log(`File saved: ${safeCat}/${safeSlug}.md by ${session.user?.email}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}