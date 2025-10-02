import fetch from 'node-fetch';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export interface HNItem {
  id: number;
  deleted?: boolean;
  type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
  by?: string;
  time: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  parts?: number[];
  descendants?: number;
}

export interface HNUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted: number[];
}

export class HackerNewsAPI {
  /**
   * Get an item by ID
   */
  static async getItem(id: number): Promise<HNItem | null> {
    try {
      const response = await fetch(`${BASE_URL}/item/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item ${id}: ${response.status}`);
      }
      return await response.json() as HNItem;
    } catch (error) {
      console.error(`Error fetching item ${id}:`, error);
      return null;
    }
  }

  /**
   * Get a user by ID
   */
  static async getUser(id: string): Promise<HNUser | null> {
    try {
      const response = await fetch(`${BASE_URL}/user/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user ${id}: ${response.status}`);
      }
      return await response.json() as HNUser;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  /**
   * Get the current max item ID
   */
  static async getMaxItemId(): Promise<number> {
    try {
      const response = await fetch(`${BASE_URL}/maxitem.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch max item ID: ${response.status}`);
      }
      return await response.json() as number;
    } catch (error) {
      console.error('Error fetching max item ID:', error);
      return 0;
    }
  }

  /**
   * Get top stories IDs
   */
  static async getTopStories(): Promise<number[]> {
    try {
      const response = await fetch(`${BASE_URL}/topstories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch top stories: ${response.status}`);
      }
      return await response.json() as number[];
    } catch (error) {
      console.error('Error fetching top stories:', error);
      return [];
    }
  }

  /**
   * Get new stories IDs
   */
  static async getNewStories(): Promise<number[]> {
    try {
      const response = await fetch(`${BASE_URL}/newstories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch new stories: ${response.status}`);
      }
      return await response.json() as number[];
    } catch (error) {
      console.error('Error fetching new stories:', error);
      return [];
    }
  }

  /**
   * Get best stories IDs
   */
  static async getBestStories(): Promise<number[]> {
    try {
      const response = await fetch(`${BASE_URL}/beststories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch best stories: ${response.status}`);
      }
      return await response.json() as number[];
    } catch (error) {
      console.error('Error fetching best stories:', error);
      return [];
    }
  }

  /**
   * Get ask stories IDs
   */
  static async getAskStories(): Promise<number[]> {
    try {
      const response = await fetch(`${BASE_URL}/askstories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ask stories: ${response.status}`);
      }
      return await response.json() as number[];
    } catch (error) {
      console.error('Error fetching ask stories:', error);
      return [];
    }
  }

  /**
   * Get show stories IDs
   */
  static async getShowStories(): Promise<number[]> {
    try {
      const response = await fetch(`${BASE_URL}/showstories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch show stories: ${response.status}`);
      }
      return await response.json() as number[];
    } catch (error) {
      console.error('Error fetching show stories:', error);
      return [];
    }
  }

  /**
   * Get job stories IDs
   */
  static async getJobStories(): Promise<number[]> {
    try {
      const response = await fetch(`${BASE_URL}/jobstories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch job stories: ${response.status}`);
      }
      return await response.json() as number[];
    } catch (error) {
      console.error('Error fetching job stories:', error);
      return [];
    }
  }

  /**
   * Get updates (changed items and profiles)
   */
  static async getUpdates(): Promise<{ items: number[]; profiles: string[] }> {
    try {
      const response = await fetch(`${BASE_URL}/updates.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch updates: ${response.status}`);
      }
      return await response.json() as { items: number[]; profiles: string[] };
    } catch (error) {
      console.error('Error fetching updates:', error);
      return { items: [], profiles: [] };
    }
  }
}