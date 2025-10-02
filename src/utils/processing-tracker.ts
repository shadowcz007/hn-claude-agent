import fs from 'fs/promises';
import path from 'path';

export interface ProcessingRecord {
  id: string;
  type: 'story' | 'analysis' | 'brief';
  hnId?: number;
  processedAt: Date;
  status: 'success' | 'error' | 'skipped';
  errorMessage?: string;
}

export interface ProcessingStats {
  lastProcessedAt: Date;
  totalProcessed: number;
  totalErrors: number;
  totalSkipped: number;
  lastMaxItemId: number;
  lastNewStoriesCount: number;
}

export class ProcessingTracker {
  private static readonly TRACKER_DIR = path.join(process.cwd(), 'data', 'tracker');
  private static readonly RECORDS_FILE = path.join(this.TRACKER_DIR, 'processing-records.json');
  private static readonly STATS_FILE = path.join(this.TRACKER_DIR, 'processing-stats.json');

  /**
   * Initialize the tracker directory
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.TRACKER_DIR, { recursive: true });
    } catch (error) {
      console.error('Error initializing processing tracker:', error);
      throw error;
    }
  }

  /**
   * Load processing records
   */
  static async loadRecords(): Promise<ProcessingRecord[]> {
    try {
      const data = await fs.readFile(this.RECORDS_FILE, 'utf-8');
      const records = JSON.parse(data) as ProcessingRecord[];
      // Convert date strings back to Date objects
      return records.map(record => ({
        ...record,
        processedAt: new Date(record.processedAt)
      }));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      console.error('Error loading processing records:', error);
      throw error;
    }
  }

  /**
   * Save processing records
   */
  static async saveRecords(records: ProcessingRecord[]): Promise<void> {
    try {
      await fs.writeFile(this.RECORDS_FILE, JSON.stringify(records, null, 2));
    } catch (error) {
      console.error('Error saving processing records:', error);
      throw error;
    }
  }

  /**
   * Add a new processing record
   */
  static async addRecord(record: Omit<ProcessingRecord, 'processedAt'>): Promise<void> {
    const records = await this.loadRecords();
    const newRecord: ProcessingRecord = {
      ...record,
      processedAt: new Date()
    };
    records.push(newRecord);
    await this.saveRecords(records);
  }

  /**
   * Check if a story has been processed
   */
  static async isStoryProcessed(hnId: number): Promise<boolean> {
    const records = await this.loadRecords();
    return records.some(record => 
      record.hnId === hnId && 
      record.status === 'success' && 
      (record.type === 'story' || record.type === 'analysis')
    );
  }

  /**
   * Get processing statistics
   */
  static async getStats(): Promise<ProcessingStats> {
    try {
      const data = await fs.readFile(this.STATS_FILE, 'utf-8');
      const stats = JSON.parse(data) as ProcessingStats;
      return {
        ...stats,
        lastProcessedAt: new Date(stats.lastProcessedAt)
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          lastProcessedAt: new Date(0),
          totalProcessed: 0,
          totalErrors: 0,
          totalSkipped: 0,
          lastMaxItemId: 0,
          lastNewStoriesCount: 0
        };
      }
      console.error('Error loading processing stats:', error);
      throw error;
    }
  }

  /**
   * Update processing statistics
   */
  static async updateStats(stats: Partial<ProcessingStats>): Promise<void> {
    const currentStats = await this.getStats();
    const updatedStats: ProcessingStats = {
      ...currentStats,
      ...stats,
      lastProcessedAt: stats.lastProcessedAt || currentStats.lastProcessedAt
    };
    
    try {
      await fs.writeFile(this.STATS_FILE, JSON.stringify(updatedStats, null, 2));
    } catch (error) {
      console.error('Error saving processing stats:', error);
      throw error;
    }
  }

  /**
   * Check if there are new stories to process
   */
  static async hasNewStories(currentMaxItemId: number, currentNewStoriesCount: number): Promise<boolean> {
    const stats = await this.getStats();
    
    // Check if max item ID has increased (indicating new content)
    if (currentMaxItemId > stats.lastMaxItemId) {
      return true;
    }
    
    // Check if new stories count has changed
    if (currentNewStoriesCount !== stats.lastNewStoriesCount) {
      return true;
    }
    
    return false;
  }

  /**
   * Get recent processing activity
   */
  static async getRecentActivity(hours: number = 24): Promise<ProcessingRecord[]> {
    const records = await this.loadRecords();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return records.filter(record => record.processedAt > cutoffTime);
  }

  /**
   * Clean up old records (keep only last 30 days)
   */
  static async cleanupOldRecords(): Promise<void> {
    const records = await this.loadRecords();
    const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const filteredRecords = records.filter(record => record.processedAt > cutoffTime);
    
    if (filteredRecords.length !== records.length) {
      await this.saveRecords(filteredRecords);
      console.log(`Cleaned up ${records.length - filteredRecords.length} old processing records`);
    }
  }
}
