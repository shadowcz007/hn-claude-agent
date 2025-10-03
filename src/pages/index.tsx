import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { DataManager } from '../utils/data-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ConfigManager } from '../utils/config';

interface Brief {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  createdAt: string;
}

interface TrendItem {
  trend: string;
  count: number;
  relatedBriefs: Array<{
    id: string;
    title: string;
    summary: string;
    keyPoints: string[];
    technicalInsights: string[];
    trends: string[];
  }>;
}

interface TrendStatistics {
  totalTrends: number;
  totalBriefs: number;
  avgTrendsPerBrief: number;
}

interface TrendsData {
  topTrends: TrendItem[];
  statistics: TrendStatistics;
  generatedAt: string;
}

interface HomePageProps {
  briefs: Brief[];
  trends: TrendsData;
}

export default function HomePage({ briefs, trends }: HomePageProps) {
  // 管理每个趋势卡片的展开状态
  const [expandedTrends, setExpandedTrends] = useState<Set<string>>(new Set());

  // 切换趋势卡片的展开状态
  const toggleTrendExpansion = (trendName: string) => {
    setExpandedTrends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trendName)) {
        newSet.delete(trendName);
      } else {
        newSet.add(trendName);
      }
      return newSet;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>HN Claude Agent - Technical Trend Insights</title>
        <meta name="description" content="Automated technology trend insights from HackerNews" />
      </Head>

      <header className="mb-12 text-center">
       
        <a className="mt-6 flex justify-center"
        target='_blank'
         href='https://www.codenow.wiki'>
          <Badge variant="outline" className="text-sm">
            Powered by Mixlab AI 编程 codenow.wiki
          </Badge>
        </a>
      </header>

      {/* 技术趋势洞察 - 整合部分 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">技术趋势洞察</h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              基于 {trends.statistics.totalBriefs} 篇分析
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/archive">查看全部</Link>
            </Button>
          </div>
        </div>

        {/* 趋势概览 - 缩小版统计信息 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </div>
              <span className="font-medium">趋势概览</span>
            </div>
            <div className="flex items-center gap-6">
              <span>{trends.statistics.totalTrends} 个趋势</span>
              <span>{trends.statistics.totalBriefs} 篇简报</span>
              <span>平均 {trends.statistics.avgTrendsPerBrief} 趋势/简报</span>
            </div>
          </div>
        </div>

        {/* 主要内容区域 - 左右布局 */}
        {trends.topTrends.length === 0 && briefs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-muted-foreground mb-2">暂无趋势数据</h3>
                <p className="text-muted-foreground">等待更多分析结果，系统将自动更新...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：热门技术趋势 - 列表形式高密度展示 */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                热门技术趋势
              </h3>
              
              {trends.topTrends.length > 0 && (
                <div className="space-y-4">
                  {trends.topTrends.slice(0, 10).map((trendItem, index) => {
                    const isExpanded = expandedTrends.has(trendItem.trend);
                    return (
                      <div key={trendItem.trend} className="bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        {/* 可点击的标题区域 */}
                        <div 
                          className="p-4 cursor-pointer"
                          onClick={() => toggleTrendExpansion(trendItem.trend)}
                        >
                          <div className="flex items-start gap-4">
                            {/* 排名和趋势标题 */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-lg text-slate-800 mb-1">{trendItem.trend}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{trendItem.count} 次出现</span>
                                  <span>{trendItem.relatedBriefs.length} 篇相关简报</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-primary rounded-full h-1.5 transition-all duration-300"
                                        style={{ 
                                          width: `${Math.min(100, (trendItem.count / Math.max(...trends.topTrends.map(t => t.count))) * 100)}%` 
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs">
                                      {Math.round((trendItem.count / Math.max(...trends.topTrends.map(t => t.count))) * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* 展开/折叠图标 */}
                            <div className="flex-shrink-0">
                              <svg 
                                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* 可折叠的详细内容区域 */}
                        {isExpanded && trendItem.relatedBriefs.length > 0 && (
                          <div className="px-4 pb-4 border-t border-slate-100">
                            <div className="pt-4 space-y-3">
                              {trendItem.relatedBriefs.slice(0, 2).map((brief, briefIndex) => (
                                <div key={brief.id} className="p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                                  <div className="space-y-2">
                                    {/* 标题弱化 */}
                                    <Link href={`/brief/${brief.id}`} className="text-xs text-slate-500 hover:text-primary hover:underline line-clamp-1 block">
                                      {brief.title}
                                    </Link>
                                    
                                    {/* 核心洞察 - 最突出 */}
                                    {brief.technicalInsights && brief.technicalInsights.length > 0 && (
                                      <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                                            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 8 8">
                                              <path d="M4 0L5.5 2.5L8 2.5L6 4L6.5 6.5L4 5L1.5 6.5L2 4L0 2.5L2.5 2.5L4 0Z"/>
                                            </svg>
                                          </div>
                                          <span className="text-xs font-semibold text-blue-700">核心洞察</span>
                                        </div>
                                        <div className="text-xs text-blue-800 leading-relaxed">
                                          {brief.technicalInsights.map((insight, insightIndex) => (
                                            <div key={insightIndex} className="mb-1">
                                              {insight}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* 关键要点 - 次要突出 */}
                                    {brief.keyPoints && brief.keyPoints.length > 0 && (
                                      <div className="p-2 bg-emerald-50 rounded border-l-2 border-emerald-400">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 8 8">
                                              <path d="M4 0L5.5 2.5L8 2.5L6 4L6.5 6.5L4 5L1.5 6.5L2 4L0 2.5L2.5 2.5L4 0Z"/>
                                            </svg>
                                          </div>
                                          <span className="text-xs font-semibold text-emerald-700">关键要点</span>
                                        </div>
                                        <div className="text-xs text-emerald-800 leading-relaxed">
                                          {brief.keyPoints.map((point, pointIndex) => (
                                            <div key={pointIndex} className="mb-1">
                                              {point}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* 趋势关联 - 标签化 */}
                                    {brief.trends && brief.trends.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {brief.trends.slice(0, 3).map((trend, trendIndex) => (
                                          <span key={trendIndex} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                                            {trend}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 右侧：趋势概览小卡片和最新技术简报 */}
            <div className="space-y-6">
              {/* 趋势概览小卡片 */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                    </div>
                    趋势概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">识别趋势</span>
                      <span className="text-lg font-bold text-blue-600">{trends.statistics.totalTrends}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">分析简报</span>
                      <span className="text-lg font-bold text-blue-600">{trends.statistics.totalBriefs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">平均趋势/简报</span>
                      <span className="text-lg font-bold text-blue-600">{trends.statistics.avgTrendsPerBrief}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 最新技术简报 */}
              {briefs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    最新简报
                  </h3>
                  <div className="space-y-3">
                    {briefs.slice(0, 6).map((brief) => (
                      <Card key={brief.id} className="hover:shadow-md transition-all duration-200 border-l-2 border-l-primary/20">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <Link href={`/brief/${brief.id}`} className="text-sm text-slate-700 hover:text-primary hover:underline line-clamp-2 block font-medium">
                              {brief.title}
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {brief.summary}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {brief.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {brief.tags.length > 2 && (
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                  +{brief.tags.length - 2}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {brief.createdAt ? new Date(brief.createdAt).toLocaleDateString('zh-CN') : '未知日期'}
                              </span>
                              <Link href={`/brief/${brief.id}`} className="text-xs text-primary hover:underline">
                                阅读 →
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="mb-12">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              About This System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              This system automatically analyzes HackerNews content using Claude AI to identify and summarize
              the latest technology trends and insights.
            </p>
            <p className="text-muted-foreground">
              New briefs are generated hourly to keep you updated on the most relevant technical developments.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export async function getStaticProps() {
  try {
    await DataManager.initialize();
    const briefs = await DataManager.getBriefMetadata();

    // Filter out error analysis results (those with both '错误' and '分析失败' tags)
    const validBriefs = briefs.filter(brief =>
      !(brief.tags.includes('错误') && brief.tags.includes('分析失败'))
    );

    // Only show the 9 most recent valid briefs on the homepage
    const recentBriefs = validBriefs.slice(0, 9);

    // Convert to serializable format
    const serializedBriefs = recentBriefs.map(brief => ({
      ...brief,
      createdAt: brief.createdAt?.toISOString()
    }));

    // 生成趋势数据
    const allBriefs = await DataManager.loadAllBriefs();
    const validAllBriefs = allBriefs.filter(brief =>
      !(brief.tags.includes('错误') && brief.tags.includes('分析失败'))
    );

    // 聚合所有趋势 - 使用黑名单过滤
    const trendCounts: Record<string, number> = {};
    const trendDetails: Record<string, Array<{
      id: string, 
      title: string, 
      summary: string,
      keyPoints: string[],
      technicalInsights: string[],
      trends: string[]
    }>> = {};

    validAllBriefs.forEach(brief => {
      if (brief.tags && brief.tags.length > 0) {
        // 使用ConfigManager过滤黑名单tags
        const filteredTags = ConfigManager.filterTags(brief.tags);
        
        filteredTags.forEach(tag => {
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
    const config = ConfigManager.getConfig();
    const topTrends = Object.entries(trendCounts)
      .filter(([, count]) => count >= config.trendsConfig.minOccurrenceThreshold)
      .sort(([,a], [,b]) => b - a)
      .slice(0, config.trendsConfig.maxTrends)
      .map(([trend, count]) => ({
        trend,
        count,
        relatedBriefs: trendDetails[trend].slice(0, 3) // 每个趋势显示3个相关简报
      }));

    // 计算趋势统计信息
    const totalTrends = Object.keys(trendCounts).length;
    const totalBriefs = validAllBriefs.length;
    const avgTrendsPerBrief = totalBriefs > 0 ? 
      Object.values(trendCounts).reduce((sum, count) => sum + count, 0) / totalBriefs : 0;

    const trendsData = {
      topTrends,
      statistics: {
        totalTrends,
        totalBriefs,
        avgTrendsPerBrief: Math.round(avgTrendsPerBrief * 100) / 100
      },
      generatedAt: new Date().toISOString()
    };

    return {
      props: {
        briefs: serializedBriefs,
        trends: trendsData
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error loading briefs for homepage:', error);
    return {
      props: {
        briefs: [],
        trends: {
          topTrends: [],
          statistics: {
            totalTrends: 0,
            totalBriefs: 0,
            avgTrendsPerBrief: 0
          },
          generatedAt: new Date().toISOString()
        }
      },
      revalidate: 3600,
    };
  }
}