import { Post, MarketItem } from '../types';

const DB_CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a067127101a0686686f70495';

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
    const sanitizedPosts = posts.slice(0, 30).map(p => {
      const cleanAvatar = p.authorAvatar?.startsWith('data:')
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        : p.authorAvatar;

      const cleanImages = Array.isArray(p.images)
        ? p.images.map(img => {
            if (typeof img === 'string' && img.length > 10000) {
              return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600';
            }
            return img;
          })
        : undefined;

      return {
        ...p,
        authorAvatar: cleanAvatar,
        images: cleanImages,
      };
    });

    const bodyPayload = JSON.stringify({
      posts: sanitizedPosts,
      marketItems: marketItems.slice(0, 30),
      isDelete,
    });

    // 1. Send to primary Vercel API
    const res = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyPayload,
    });

    if (!res.ok) {
      // 2. Fail-safe direct cloud write if Vercel endpoint had any issue
      await fetch(DB_CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'sosedi_app_v2',
          data: {
            posts: sanitizedPosts,
            marketItems: marketItems.slice(0, 30),
          }
        }),
      });
    }
  } catch (err) {
    console.warn('Primary push failed, executing direct cloud write fallback:', err);
    try {
      await fetch(DB_CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'sosedi_app_v2',
          data: {
            posts: posts.slice(0, 30),
            marketItems: marketItems.slice(0, 30),
          }
        }),
      });
    } catch (e2) {
      console.warn('Direct cloud write also failed:', e2);
    }
  }
};
