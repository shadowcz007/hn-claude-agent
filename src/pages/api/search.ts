import { NextApiRequest, NextApiResponse } from 'next';
import { DataManager } from '../../utils/data-manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await DataManager.initialize();
  
  try {
    switch (req.method) {
      case 'GET':
        return handleGET(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const briefs = await DataManager.searchBriefs(q);
    const serializedBriefs = briefs.map(brief => ({
      ...brief,
      createdAt: brief.createdAt?.toISOString()
    }));
    
    return res.status(200).json(serializedBriefs);
  } catch (error) {
    console.error('Error in search handler:', error);
    res.status(500).json({ error: 'Failed to search briefs' });
  }
}