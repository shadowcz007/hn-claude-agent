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

interface HomePageProps {
  briefs: Brief[];
}

export default function HomePage({ briefs }: HomePageProps) {
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

      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">Latest Tech Trends</h2>
          <Button variant="outline" asChild>
            <Link href="/archive">View All</Link>
          </Button>
        </div>
        
        {briefs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No briefs available yet</h3>
                <p className="text-muted-foreground">Check back soon for the latest tech trends!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
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
                        +{brief.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {brief.createdAt ? new Date(brief.createdAt).toLocaleDateString('en-US') : 'Unknown date'}
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/brief/${brief.id}`}>Read More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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

    return {
      props: {
        briefs: serializedBriefs
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error loading briefs for homepage:', error);
    return {
      props: {
        briefs: []
      },
      revalidate: 3600,
    };
  }
}