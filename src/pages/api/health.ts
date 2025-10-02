import { NextApiRequest, NextApiResponse } from 'next';
import { ProcessingTracker } from '../../utils/processing-tracker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取处理统计信息
    const stats = await ProcessingTracker.getStats();
    
    // 计算系统状态
    const now = new Date();
    const lastProcessedTime = stats.lastProcessedAt.getTime();
    const timeSinceLastProcess = now.getTime() - lastProcessedTime;
    const hoursSinceLastProcess = timeSinceLastProcess / (1000 * 60 * 60);
    
    // 判断系统健康状态
    let status = 'healthy';
    let message = '系统运行正常';
    
    if (hoursSinceLastProcess > 24) {
      status = 'warning';
      message = '超过24小时未处理数据';
    } else if (hoursSinceLastProcess > 48) {
      status = 'error';
      message = '超过48小时未处理数据';
    }
    
    // 检查错误率
    const totalAttempts = stats.totalProcessed + stats.totalErrors + stats.totalSkipped;
    const errorRate = totalAttempts > 0 ? (stats.totalErrors / totalAttempts) * 100 : 0;
    
    if (errorRate > 50) {
      status = 'error';
      message = `错误率过高: ${errorRate.toFixed(1)}%`;
    } else if (errorRate > 20) {
      status = 'warning';
      message = `错误率较高: ${errorRate.toFixed(1)}%`;
    }

    const healthData = {
      status,
      message,
      timestamp: now.toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      stats: {
        lastProcessedAt: stats.lastProcessedAt.toISOString(),
        totalProcessed: stats.totalProcessed,
        totalErrors: stats.totalErrors,
        totalSkipped: stats.totalSkipped,
        lastMaxItemId: stats.lastMaxItemId,
        lastNewStoriesCount: stats.lastNewStoriesCount,
        hoursSinceLastProcess: Math.round(hoursSinceLastProcess * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      }
    };

    // 根据状态返回相应的 HTTP 状态码
    const httpStatus = status === 'error' ? 503 : status === 'warning' ? 200 : 200;
    
    res.status(httpStatus).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
