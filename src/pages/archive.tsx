import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DataManager } from '../utils/data-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface Brief {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  createdAt: string;
}

interface ArchivePageProps {
  allBriefs: Brief[];
}

export default function ArchivePage({ allBriefs }: ArchivePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  
  // Extract unique tags from all briefs
  const allTags = Array.from(
    new Set(allBriefs.flatMap(brief => brief.tags))
  ).sort();

  // Filter briefs based on search term and selected tag
  const filteredBriefs = allBriefs.filter(brief => {
    const matchesSearch = 
      searchTerm === '' || 
      brief.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = 
      selectedTag === 'all' || 
      brief.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Archive - HN Claude Agent</title>
        <meta name="description" content="Archive of all technical trend briefs" />
      </Head>

      <header className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Brief Archive</h1>
            <p className="text-muted-foreground">
              Browse and search through all technical trend insights
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredBriefs.length} briefs
          </Badge>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search briefs by title, summary, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <select
                className="px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </header>

      <section>
        {filteredBriefs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No briefs found</h3>
                <p className="text-muted-foreground mb-4">
                  No briefs match your search criteria. Try adjusting your filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTag('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBriefs.map((brief) => (
              <Card key={brief.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    <Link href={`/brief/${brief.id}`} className="hover:underline">
                      {brief.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {brief.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {brief.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant={selectedTag === tag ? "default" : "secondary"}
                        className="text-xs cursor-pointer hover:bg-primary/80 transition-colors"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Generated on {brief.createdAt ? new Date(brief.createdAt).toLocaleDateString() : 'Unknown date'}
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
    </div>
  );
}

export async function getStaticProps() {
  try {
    await DataManager.initialize();
    const briefs = await DataManager.getBriefMetadata();
    const allBriefs = briefs.map(brief => ({
      ...brief,
      createdAt: brief.createdAt?.toISOString()
    }));

    return {
      props: {
        allBriefs
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error loading briefs for archive:', error);
    return {
      props: {
        allBriefs: []
      },
      revalidate: 3600,
    };
  }
}