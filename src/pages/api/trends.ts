import { NextApiRequest, NextApiResponse } from 'next';
import { DataManager } from '../../utils/data-manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await DataManager.initialize();
    
    // 获取所有简报
    const briefs = await DataManager.loadAllBriefs();
    
    // 过滤掉错误分析结果
    const validBriefs = briefs.filter(brief =>
      !(brief.tags.includes('错误') && brief.tags.includes('分析失败'))
    );

    // 聚合所有趋势
    const trendCounts: Record<string, number> = {};
    const trendDetails: Record<string, Array<{
      id: string, 
      title: string, 
      summary: string,
      keyPoints: string[],
      technicalInsights: string[],
      trends: string[]
    }>> = {};

    validBriefs.forEach(brief => {
      if (brief.tags && brief.tags.length > 0) {
        brief.tags.forEach(tag => {
          if (!trendCounts[tag]) {
            trendCounts[tag] = 0;
            trendDetails[tag] = [];
          }
          trendCounts[tag]++;
          trendDetails[tag].push({
            id: brief.id,
            title: brief.title,
            summary: brief.summary,
            keyPoints: brief.analysis?.keyPoints || [],
            technicalInsights: brief.analysis?.technicalInsights || [],
            trends: brief.analysis?.trends || []
          });
        });
      }
    });

    // 按出现次数排序，获取Top N趋势
    const topTrends = Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // 取前10个趋势
      .map(([trend, count]) => ({
        trend,
        count,
        relatedBriefs: trendDetails[trend].slice(0, 3) // 每个趋势显示3个相关简报
      }));

    // 计算趋势统计信息
    const totalTrends = Object.keys(trendCounts).length;
    const totalBriefs = validBriefs.length;
    const avgTrendsPerBrief = totalBriefs > 0 ? 
      Object.values(trendCounts).reduce((sum, count) => sum + count, 0) / totalBriefs : 0;

    const response = {
      topTrends,
      statistics: {
        totalTrends,
        totalBriefs,
        avgTrendsPerBrief: Math.round(avgTrendsPerBrief * 100) / 100
      },
      generatedAt: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
}
