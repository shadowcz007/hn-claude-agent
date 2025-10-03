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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trends.topTrends.slice(0, 6).map((trendItem, index) => (
                    <Card key={trendItem.trend} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </div>
                            <CardTitle className="text-lg line-clamp-2">
                              {trendItem.trend}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {trendItem.count} 次
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {trendItem.relatedBriefs.slice(0, 2).map((brief) => (
                            <div key={brief.id} className="text-sm p-2 bg-muted/30 rounded-md">
                              <Link href={`/brief/${brief.id}`} className="text-primary hover:underline line-clamp-1 font-medium">
                                {brief.title}
                              </Link>
                              <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                                {brief.summary}
                              </p>
                            </div>
                          ))}
                          {trendItem.relatedBriefs.length > 2 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              +{trendItem.relatedBriefs.length - 2} 更多相关简报
                            </p>
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
    const trendDetails: Record<string, Array<{id: string, title: string, summary: string}>> = {};

    validAllBriefs.forEach(brief => {
      if (brief.analysis?.trends) {
        brief.analysis.trends.forEach(trend => {
          if (!trendCounts[trend]) {
            trendCounts[trend] = 0;
            trendDetails[trend] = [];
          }
          trendCounts[trend]++;
          trendDetails[trend].push({
            id: brief.id,
            title: brief.title,
            summary: brief.summary
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