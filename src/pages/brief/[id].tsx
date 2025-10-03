import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DataManager } from '../../utils/data-manager';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

interface Brief {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  createdAt: string;
  url?: string;
}

interface BriefDetailProps {
  brief: Brief | null;
}

export default function BriefDetail({ brief }: BriefDetailProps) {
  const router = useRouter();
  
  if (router.isFallback) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading brief...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Brief not found</h3>
              <p className="text-muted-foreground mb-4">
                The brief you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>{brief.title} - HN Claude Agent</title>
        <meta name="description" content={brief.summary} />
      </Head>

      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/archive" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Archive
          </Link>
        </Button>
      </div>

      <article>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-4 leading-tight">
              {brief.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-4">
              {brief.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Generated on {brief.createdAt ? new Date(brief.createdAt).toLocaleString() : 'Unknown date'}</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 mt-5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-4">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-lg font-semibold mb-2 mt-3">{children}</h4>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">{children}</blockquote>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
                    }
                    return <code className={className}>{children}</code>;
                  },
                  pre: ({ children }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => <table className="w-full border-collapse border border-border mb-4">{children}</table>,
                  th: ({ children }) => <th className="border border-border px-3 py-2 bg-muted font-semibold text-left">{children}</th>,
                  td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
                }}
              >
                {brief.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}

export async function getStaticPaths() {
  try {
    await DataManager.initialize();
    const briefs = await DataManager.getBriefMetadata();
    
    const paths = briefs.map(brief => ({
      params: { id: brief.id }
    }));

    return {
      paths,
      fallback: true, // Show loading state for not-yet-generated pages
    };
  } catch (error) {
    console.error('Error generating paths for briefs:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  try {
    await DataManager.initialize();
    const brief = await DataManager.loadBrief(params.id);
    
    if (!brief) {
      return {
        notFound: true,
      };
    }

    // Convert date back to string for serialization
    const serializedBrief = {
      ...brief,
      createdAt: brief.createdAt?.toISOString()
    };

    return {
      props: {
        brief: serializedBrief
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error loading brief ${params.id}:`, error);
    return {
      notFound: true,
    };
  }
}