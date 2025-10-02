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
    const { id, search, tag } = req.query;
    
    if (id) {
      // Get specific brief
      const brief = await DataManager.loadBrief(id as string);
      if (!brief) {
        return res.status(404).json({ error: 'Brief not found' });
      }
      
      // Convert date back to string for serialization
      const serializedBrief = {
        ...brief,
        createdAt: brief.createdAt?.toISOString()
      };
      
      return res.status(200).json(serializedBrief);
    } else if (search) {
      // Search briefs
      const briefs = await DataManager.searchBriefs(search as string);
      const serializedBriefs = briefs.map(brief => ({
        ...brief,
        createdAt: brief.createdAt?.toISOString()
      }));
      
      return res.status(200).json(serializedBriefs);
    } else if (tag) {
      // Get briefs by tag
      const briefs = await DataManager.getBriefsByTag(tag as string);
      const serializedBriefs = briefs.map(brief => ({
        ...brief,
        createdAt: brief.createdAt?.toISOString()
      }));
      
      return res.status(200).json(serializedBriefs);
    } else {
      // Get all briefs metadata
      const briefs = await DataManager.getBriefMetadata();
      const serializedBriefs = briefs.map(brief => ({
        ...brief,
        createdAt: brief.createdAt?.toISOString()
      }));
      
      return res.status(200).json(serializedBriefs);
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    res.status(500).json({ error: 'Failed to fetch briefs' });
  }
}