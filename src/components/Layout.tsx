import { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'HN Claude Agent' }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HN</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Claude Agent
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            <Link href="/archive">
              <Button variant="ghost" size="sm">
                Archive
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground font-medium">
                HN Claude Agent
              </p>
              <p className="text-sm text-muted-foreground">
                Automated Technical Trend Insights from HackerNews
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Claude AI</Badge>
              <Badge variant="secondary">HackerNews API</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}