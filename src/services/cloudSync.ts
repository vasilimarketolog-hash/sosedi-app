import { Post, MarketItem } from '../types';
import { initialPosts, initialMarketItems } from '../mockData';

const CLOUD_CONTAINER_ID = 'ff8081819ff5b11001a02369a8ad6a3d';
const API_URL = `https://api.restful-api.dev/objects/${CLOUD_CONTAINER_ID}`;

export interface CloudStoreData {
  posts: Post[];
  marketItems: MarketItem[];
}

// Clean heavy base64 images for cloud storage to keep payload small (< 50KB)
const sanitizePostForCloud = (post: Post): Post => {
  const cleanImages = post.images?.map(img => {
    if (img.startsWith('data:')) {
      // Replace raw base64 with a lightweight unsplash placeholder for cloud payload
      return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800';
    }
    return img;
  });

  const cleanAvatar = post.authorAvatar?.startsWith('data:') 
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    : post.authorAvatar;

  return {
    ...post,
    authorAvatar: cleanAvatar,
    images: cleanImages,
  };
};

export const fetchCloudData = async (): Promise<CloudStoreData | null> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return null;
    const json = await response.json();
    if (json && json.data) {
      return {
        posts: Array.isArray(json.data.posts) ? json.data.posts : [],
        marketItems: Array.isArray(json.data.marketItems) ? json.data.marketItems : [],
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
    const sanitizedPosts = posts.slice(0, 30).map(sanitizePostForCloud);
    const sanitizedMarket = marketItems.slice(0, 30);

    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'sosedi_app_production_v1',
        data: {
          posts: sanitizedPosts,
          marketItems: sanitizedMarket,
        },
      }),
    });
    
    if (!res.ok) {
      console.warn('Cloud sync PUT status:', res.status, res.statusText);
    }
  } catch (err) {
    console.warn('Failed to push to cloud sync server:', err);
  }
};
