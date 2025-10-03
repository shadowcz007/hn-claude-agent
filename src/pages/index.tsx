import Head from 'next/head';
import Link from 'next/link';
import { DataManager } from '../utils/data-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

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
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>HN Claude Agent - Technical Trend Insights</title>
        <meta name="description" content="Automated technology trend insights from HackerNews" />
      </Head>

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          HN Claude Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Automated Technical Trend Insights from HackerNews
        </p>
        <div className="mt-6 flex justify-center">
          <Badge variant="outline" className="text-sm">
            Powered by Claude AI
          </Badge>
        </div>
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

        {/* 趋势概览 - 统计信息 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              趋势概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">{trends.statistics.totalTrends}</div>
                <div className="text-sm text-muted-foreground">识别趋势</div>
                <div className="text-xs text-muted-foreground">从所有分析中提取</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">{trends.statistics.totalBriefs}</div>
                <div className="text-sm text-muted-foreground">分析简报</div>
                <div className="text-xs text-muted-foreground">已处理的技术内容</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">{trends.statistics.avgTrendsPerBrief}</div>
                <div className="text-sm text-muted-foreground">平均趋势/简报</div>
                <div className="text-xs text-muted-foreground">每篇简报的趋势密度</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
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
          <div className="space-y-8">
            {/* 趋势详情 - 热门技术趋势 */}
            {trends.topTrends.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  热门技术趋势
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trends.topTrends.slice(0, 6).map((trendItem, index) => (
                    <Card key={trendItem.trend} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <CardTitle className="text-lg line-clamp-2">
                                {trendItem.trend}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {trendItem.count} 次出现
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {trendItem.relatedBriefs.length} 篇相关简报
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 趋势热度指示器 */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted/30 rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, (trendItem.count / Math.max(...trends.topTrends.map(t => t.count))) * 100)}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((trendItem.count / Math.max(...trends.topTrends.map(t => t.count))) * 100)}%
                          </span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* 趋势信息展示 */}
                          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-primary">趋势信息</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p className="mb-3">
                                <span className="font-medium text-foreground">"{trendItem.trend}"</span> 是当前最热门的技术趋势之一，
                                在 {trendItem.relatedBriefs.length} 篇技术简报中被提及 {trendItem.count} 次，
                                显示出该领域在技术社区中的高度关注度和讨论热度。
                              </p>
                              
                              {/* 趋势统计信息 */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center p-2 bg-primary/5 rounded-lg">
                                  <div className="text-lg font-bold text-primary">#{index + 1}</div>
                                  <div className="text-xs text-muted-foreground">热度排名</div>
                                </div>
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600">{trendItem.count}</div>
                                  <div className="text-xs text-muted-foreground">出现频次</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                  <div className="text-lg font-bold text-green-600">{trendItem.relatedBriefs.length}</div>
                                  <div className="text-xs text-muted-foreground">相关简报</div>
                                </div>
                              </div>
                              
                              {/* 趋势描述 */}
                              {trendItem.relatedBriefs.length > 0 && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                                  <div className="text-xs font-medium text-primary mb-2">趋势描述：</div>
                                  <div className="text-xs text-muted-foreground">
                                    该趋势在技术社区中表现出强劲的发展势头，相关讨论涵盖了多个技术领域，
                                    体现了当前技术发展的前沿方向和未来潜力。
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 趋势洞察展示 */}
                          {trendItem.relatedBriefs.length > 0 && (
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-muted-foreground mb-2">
                                趋势洞察：
                              </div>
                              {trendItem.relatedBriefs.slice(0, 2).map((brief, briefIndex) => (
                                <div key={brief.id} className="text-sm p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-200/30 hover:bg-blue-50/70 transition-colors">
                                  <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0 mt-0.5">
                                      {briefIndex + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <Link href={`/brief/${brief.id}`} className="text-blue-600 hover:underline line-clamp-1 font-medium block">
                                        {brief.title}
                                      </Link>
                                      <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                                        {brief.summary}
                                      </p>
                                      
                                      {/* 显示技术洞察 */}
                                      {brief.technicalInsights && brief.technicalInsights.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs font-medium text-blue-600 mb-1">技术洞察：</div>
                                          <div className="text-xs text-muted-foreground line-clamp-2">
                                            {brief.technicalInsights[0]}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* 显示关键趋势 */}
                                      {brief.trends && brief.trends.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs font-medium text-green-600 mb-1">关键趋势：</div>
                                          <div className="text-xs text-muted-foreground line-clamp-1">
                                            {brief.trends[0]}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            相关技术简报：
                          </div>
                          {trendItem.relatedBriefs.slice(0, 3).map((brief, briefIndex) => (
                            <div key={brief.id} className="text-sm p-3 bg-muted/20 rounded-lg border border-muted/30 hover:bg-muted/30 transition-colors">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0 mt-0.5">
                                  {briefIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/brief/${brief.id}`} className="text-primary hover:underline line-clamp-1 font-medium block">
                                    {brief.title}
                                  </Link>
                                  <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                                    {brief.summary}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {trendItem.relatedBriefs.length > 3 && (
                            <div className="text-center">
                              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                                查看全部 {trendItem.relatedBriefs.length} 篇相关简报 →
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 最新简报 */}
            {briefs.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  最新技术简报
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {briefs.map((brief) => (
                    <Card key={brief.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <CardHeader>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          <Link href={`/brief/${brief.id}`} className="hover:underline">
                            {brief.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {brief.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {brief.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {brief.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{brief.tags.length - 3} 更多
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {brief.createdAt ? new Date(brief.createdAt).toLocaleDateString('zh-CN') : '未知日期'}
                          </p>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/brief/${brief.id}`}>阅读更多</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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

    validAllBriefs.forEach(brief => {
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