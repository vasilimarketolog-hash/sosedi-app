import { Post, MarketItem } from '../types';

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
    if (!response.ok) return null;
    const json = await response.json();
    if (json) {
      return {
        posts: Array.isArray(json.posts) ? json.posts : [],
        marketItems: Array.isArray(json.marketItems) ? json.marketItems : [],
      };
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch from Vercel sync API:', err);
    return null;
  }
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
