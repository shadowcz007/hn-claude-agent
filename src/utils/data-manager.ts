import fs from 'fs/promises';
import path from 'path';
import { AnalysisResult } from './claude-analyzer';
import { HNItem } from './hn-api';

export interface Brief {
  id: string;
  title: string;
  content: string;
  summary: string;
  analysis: AnalysisResult;
  createdAt: Date;
  tags: string[];
}

export class DataManager {
  private static readonly DATA_DIR = path.join(process.cwd(), 'data');
  private static readonly BRIEF_DIR = path.join(process.cwd(), 'posts');

  /**
   * Initialize data directories
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.DATA_DIR, { recursive: true });
      await fs.mkdir(this.BRIEF_DIR, { recursive: true });
    } catch (error) {
      console.error('Error initializing data directories:', error);
      throw error;
    }
  }

  /**
   * Save raw HackerNews data
   */
  static async saveRawData(data: any, filename: string): Promise<void> {
    try {
      const filePath = path.join(this.DATA_DIR, `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving raw data to ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load raw HackerNews data
   */
  static async loadRawData(filename: string): Promise<any> {
    try {
      const filePath = path.join(this.DATA_DIR, `${filename}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return null
        return null;
      }
      console.error(`Error loading raw data from ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Check if raw data exists for a story
   */
  static async hasRawData(storyId: number): Promise<boolean> {
    try {
      const filePath = path.join(this.DATA_DIR, `story-${storyId}.json`);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all cached story IDs
   */
  static async getCachedStoryIds(): Promise<number[]> {
    try {
      const files = await fs.readdir(this.DATA_DIR);
      const storyFiles = files.filter(file => file.startsWith('story-') && file.endsWith('.json'));
      return storyFiles.map(file => {
        const match = file.match(/story-(\d+)\.json/);
        return match ? parseInt(match[1]) : 0;
      }).filter(id => id > 0);
    } catch (error) {
      console.error('Error getting cached story IDs:', error);
      return [];
    }
  }

  /**
   * Get raw data statistics
   */
  static async getRawDataStats(): Promise<{
    totalStories: number;
    oldestStory: number | null;
    newestStory: number | null;
    totalSize: number;
  }> {
    try {
      const storyIds = await this.getCachedStoryIds();
      if (storyIds.length === 0) {
        return {
          totalStories: 0,
          oldestStory: null,
          newestStory: null,
          totalSize: 0
        };
      }

      const sortedIds = storyIds.sort((a, b) => a - b);
      let totalSize = 0;

      for (const id of storyIds) {
        try {
          const filePath = path.join(this.DATA_DIR, `story-${id}.json`);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        } catch (error) {
          // Ignore individual file errors
        }
      }

      return {
        totalStories: storyIds.length,
        oldestStory: sortedIds[0],
        newestStory: sortedIds[sortedIds.length - 1],
        totalSize
      };
    } catch (error) {
      console.error('Error getting raw data stats:', error);
      return {
        totalStories: 0,
        oldestStory: null,
        newestStory: null,
        totalSize: 0
      };
    }
  }

  /**
   * Load raw story data by ID
   */
  static async loadRawStory(storyId: number): Promise<any> {
    return await this.loadRawData(`story-${storyId}`);
  }

  /**
   * Save analysis result
   */
  static async saveAnalysis(analysis: AnalysisResult): Promise<void> {
    try {
      const filePath = path.join(this.DATA_DIR, `analysis-${analysis.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.error(`Error saving analysis ${analysis.id}:`, error);
      throw error;
    }
  }

  /**
   * Load analysis result
   */
  static async loadAnalysis(id: string): Promise<AnalysisResult | null> {
    try {
      const filePath = path.join(this.DATA_DIR, `analysis-${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return null
        return null;
      }
      console.error(`Error loading analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Save a brief to the posts directory
   */
  static async saveBrief(brief: Brief): Promise<void> {
    try {
      // Save as JSON file
      const jsonFilePath = path.join(this.BRIEF_DIR, `${brief.id}.json`);
      await fs.writeFile(jsonFilePath, JSON.stringify(brief, null, 2));

      // Save as Markdown file for easy reading
      const markdownContent = `# ${brief.title}

${brief.content}

## Summary
${brief.summary}

## Key Points
${brief.analysis.keyPoints.map(point => `- ${point}`).join('\n')}

## Technical Insights
${brief.analysis.technicalInsights.map(insight => `- ${insight}`).join('\n')}

## Tags
${brief.tags.join(', ')}

*Generated on: ${brief.createdAt?.toISOString()}*`;
      const mdFilePath = path.join(this.BRIEF_DIR, `${brief.id}.md`);
      await fs.writeFile(mdFilePath, markdownContent);
    } catch (error) {
      console.error(`Error saving brief ${brief.id}:`, error);
      throw error;
    }
  }

  /**
   * Load a brief by ID
   */
  static async loadBrief(id: string): Promise<Brief | null> {
    try {
      const filePath = path.join(this.BRIEF_DIR, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const brief = JSON.parse(data) as Brief;
      brief.createdAt = new Date(brief.createdAt);
      return brief;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, return null
        return null;
      }
      console.error(`Error loading brief ${id}:`, error);
      throw error;
    }
  }

  /**
   * Load all briefs
   */
  static async loadAllBriefs(): Promise<Brief[]> {
    try {
      const files = await fs.readdir(this.BRIEF_DIR);
      const briefFiles = files.filter(file => file.endsWith('.json'));
      
      const briefs: Brief[] = [];
      for (const file of briefFiles) {
        const id = path.basename(file, '.json');
        const brief = await this.loadBrief(id);
        if (brief) {
          briefs.push(brief);
        }
      }
      
      // Sort by creation date, newest first
      briefs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return briefs;
    } catch (error) {
      console.error('Error loading all briefs:', error);
      throw error;
    }
  }

  /**
   * Get brief metadata (without full content) for listing
   */
  static async getBriefMetadata(): Promise<Array<Omit<Brief, 'content' | 'analysis'>>> {
    try {
      const files = await fs.readdir(this.BRIEF_DIR);
      const briefFiles = files.filter(file => file.endsWith('.json'));
      
      const metadata: Array<Omit<Brief, 'content' | 'analysis'>> = [];
      for (const file of briefFiles) {
        const id = path.basename(file, '.json');
        const brief = await this.loadBrief(id);
        if (brief) {
          metadata.push({
            id: brief.id,
            title: brief.title,
            summary: brief.summary,
            createdAt: brief.createdAt,
            tags: brief.tags
          });
        }
      }
      
      // Sort by creation date, newest first
      metadata.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return metadata;
    } catch (error) {
      console.error('Error getting brief metadata:', error);
      throw error;
    }
  }

  /**
   * Create a brief from an HN item and its analysis
   */
  static createBrief(item: HNItem, analysis: AnalysisResult): Brief {
    const content = `
# ${item.title || `HN Item ${item.id}`}

**Source:** Hacker News
**Type:** ${item.type}
**Author:** ${item.by || 'Unknown'}
**Posted:** ${new Date(item.time * 1000).toISOString()}
${item.url ? `**URL:** ${item.url}` : ''}

## Content
${item.text || 'No text content'}

## Claude Analysis
${analysis.summary}

### Key Points
${analysis.keyPoints.map(point => `- ${point}`).join('\n')}

### Technical Insights
${analysis.technicalInsights.map(insight => `- ${insight}`).join('\n')}

### Trends Identified
${analysis.trends.map(trend => `- ${trend}`).join('\n')}
    `.trim();

    return {
      id: `brief-${item.id}-${Date.now()}`,
      title: item.title || `HN Item ${item.id}`,
      content,
      summary: analysis.summary,
      analysis,
      createdAt: new Date(),
      tags: analysis.tags
    };
  }

  /**
   * Search briefs by keyword
   */
  static async searchBriefs(keyword: string): Promise<Brief[]> {
    const allBriefs = await this.loadAllBriefs();
    const lowerKeyword = keyword.toLowerCase();
    
    return allBriefs.filter(brief => 
      brief.title.toLowerCase().includes(lowerKeyword) ||
      brief.summary.toLowerCase().includes(lowerKeyword) ||
      brief.content.toLowerCase().includes(lowerKeyword) ||
      brief.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * Get briefs by tag
   */
  static async getBriefsByTag(tag: string): Promise<Brief[]> {
    const allBriefs = await this.loadAllBriefs();
    return allBriefs.filter(brief => brief.tags.includes(tag));
  }
}