import { Post, MarketItem } from '../types';

const DB_CLOUD_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a02369a8ad6a3d';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/posts`;
  }
  return 'https://sosedi-dvor.vercel.app/api/posts';
};

export interface CloudStoreData {
  posts: Post[];
  marketItems: MarketItem[];
}

export const fetchCloudData = async (): Promise<CloudStoreData | null> => {
  try {
    const response = await fetch(getApiUrl());
    if (response.ok) {
      const json = await response.json();
      if (json && Array.isArray(json.posts) && json.posts.length > 0) {
        return {
          posts: json.posts,
          marketItems: Array.isArray(json.marketItems) ? json.marketItems : [],
        };
      }
    }
  } catch (err) {
    console.warn('Primary Vercel API fetch failed, trying direct cloud fallback:', err);
  }

  // Fail-safe direct cloud DB fetch
  try {
    const directRes = await fetch(DB_CLOUD_URL);
    if (directRes.ok) {
      const json = await directRes.json();
      if (json && json.data && Array.isArray(json.data.posts)) {
        return {
          posts: json.data.posts,
          marketItems: Array.isArray(json.data.marketItems) ? json.data.marketItems : [],
        };
      }
    }
  } catch (e) {
    console.warn('Direct cloud fallback failed:', e);
  }

  return null;
};

export const syncPostsToCloud = async (posts: Post[], marketItems: MarketItem[], isDelete = false): Promise<void> => {
  try {
    const sanitizedPosts = posts.slice(0, 40).map(p => {
      const cleanAvatar = p.authorAvatar?.startsWith('data:')
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        : p.authorAvatar;
      return {
        ...p,
        authorAvatar: cleanAvatar,
      };
    });

    await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        posts: sanitizedPosts,
        marketItems: marketItems.slice(0, 40),
        isDelete,
      }),
    });
  } catch (err) {
    console.warn('Failed to push to Vercel sync API:', err);
  }
};
