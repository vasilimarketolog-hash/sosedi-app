import { Post, MarketItem } from '../types';
import { initialPosts, initialMarketItems } from '../mockData';

const CLOUD_CONTAINER_ID = 'ff8081819ff5b11001a02369a8ad6a3d';
const API_URL = `https://api.restful-api.dev/objects/${CLOUD_CONTAINER_ID}`;

export interface CloudStoreData {
  posts: Post[];
  marketItems: MarketItem[];
}

export const fetchCloudData = async (): Promise<CloudStoreData | null> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return null;
    const json = await response.json();
    if (json && json.data) {
      return {
        posts: Array.isArray(json.data.posts) && json.data.posts.length > 0 ? json.data.posts : initialPosts,
        marketItems: Array.isArray(json.data.marketItems) && json.data.marketItems.length > 0 ? json.data.marketItems : initialMarketItems,
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch from cloud sync server:', err);
    return null;
  }
};

export const syncPostsToCloud = async (posts: Post[], marketItems: MarketItem[]): Promise<void> => {
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'sosedi_app_production_v1',
        data: {
          posts: posts.slice(0, 50), // keep latest 50 posts for speed
          marketItems: marketItems.slice(0, 50),
        },
      }),
    });
  } catch (err) {
    console.warn('Failed to push to cloud sync server:', err);
  }
};
