// Vercel Serverless Function for Sosedi.Online Multi-Device Real-Time Cloud Sync
const DB_CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a067127101a0686686f70495';

const defaultDemoPosts = [
  {
    id: "p_1",
    authorId: "u_101",
    authorName: "Михаил Ковалёв",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    authorAddress: "д. 45к2, Подъезд 2",
    verified: true,
    timestamp: "25 минут назад",
    category: "urgent",
    pinned: true,
    title: "🚨 Внимание! Отключение горячей воды 15 августа",
    content: "Управляющая компания «Лиговский Сервис» сообщает, что в связи с плановой опрессовкой теплосетей 15 августа с 09:00 до 20:00 будет временно отключено горячее водоснабжение в корпусах 1, 2 и 3. Наберите запасы воды заранее!",
    likes: 24,
    userLiked: false,
    tags: ["УК", "Водоснабжение", "Важное"],
    comments: [
      {
        id: "c_1",
        authorName: "Ольга Петрова",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
        authorAddress: "д. 45к2, Подъезд 1",
        verified: true,
        content: "Спасибо за предупреждение! Опять бойлер включать.",
        timestamp: "15 минут назад",
        likes: 3
      }
    ]
  }
];

let globalPosts: any[] = defaultDemoPosts;
let globalMarketItems: any[] = [];

function getPostTime(p: any): number {
  if (!p || !p.id) return 0;
  const matches = String(p.id).match(/\d+/g);
  if (matches && matches.length > 0) {
    let maxNum = 0;
    for (const m of matches) {
      const val = Number(m);
      if (val > maxNum) maxNum = val;
    }
    if (maxNum > 100000000) return maxNum;
    return 100000 - maxNum;
  }
  return 0;
}

function sortPosts(posts: any[]) {
  posts.sort((a: any, b: any) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return getPostTime(b) - getPostTime(a);
  });
}

async function loadFromPersistentCloud() {
  try {
    const res = await fetch(DB_CLOUD_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        const postMap = new Map();
        // 1. Keep existing in-memory posts first
        globalPosts.forEach((p: any) => postMap.set(p.id, p));

        // 2. Merge cloud posts
        if (Array.isArray(json.data.posts)) {
          json.data.posts.forEach((incoming: any) => {
            const existing = postMap.get(incoming.id);
            if (!existing) {
              postMap.set(incoming.id, incoming);
            } else {
              const commentMap = new Map();
              (existing.comments || []).forEach((c: any) => commentMap.set(c.id, c));
              (incoming.comments || []).forEach((c: any) => commentMap.set(c.id, c));
              postMap.set(incoming.id, {
                ...existing,
                ...incoming,
                likes: Math.max(existing.likes || 0, incoming.likes || 0),
                comments: Array.from(commentMap.values()),
              });
            }
          });
        }

        const merged = Array.from(postMap.values());
        sortPosts(merged);
        if (merged.length > 0) {
          globalPosts = merged.slice(0, 50);
        }

        if (Array.isArray(json.data.marketItems) && json.data.marketItems.length > 0) {
          const marketMap = new Map();
          globalMarketItems.forEach((m: any) => marketMap.set(m.id, m));
          json.data.marketItems.forEach((m: any) => marketMap.set(m.id, m));
          globalMarketItems = Array.from(marketMap.values()).slice(0, 50);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load from DB_CLOUD_URL', e);
  }
}

async function saveToPersistentCloud(posts: any[], marketItems: any[]) {
  try {
    // Sanitize images to keep payload under 80KB
    const safePosts = posts.slice(0, 30).map((p: any) => {
      const safeImages = Array.isArray(p.images)
        ? p.images.map((img: string) => {
            if (typeof img === 'string' && img.length > 10000) {
              // Truncate huge base64 for cloud payload
              return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600';
            }
            return img;
          })
        : undefined;

      const cleanAvatar = p.authorAvatar && p.authorAvatar.length > 1000
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        : p.authorAvatar;

      return {
        ...p,
        authorAvatar: cleanAvatar,
        images: safeImages,
      };
    });

    await fetch(DB_CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'sosedi_app_v2',
        data: {
          posts: safePosts,
          marketItems: marketItems.slice(0, 30),
        }
      })
    });
  } catch (e) {
    console.warn('Failed to save to DB_CLOUD_URL', e);
  }
}

export default async function handler(req: any, res: any) {
  // Allow CORS from any device / origin
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Load and merge latest state from persistent cloud DB on every request
  await loadFromPersistentCloud();

  if (req.method === 'GET') {
    return res.status(200).json({
      posts: globalPosts && globalPosts.length > 0 ? globalPosts : defaultDemoPosts,
      marketItems: globalMarketItems,
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      if (body && Array.isArray(body.posts)) {
        if (body.isDelete) {
          const mergedPosts = [...body.posts];
          sortPosts(mergedPosts);
          globalPosts = mergedPosts.slice(0, 50);
        } else {
          const postMap = new Map();

          // 1. Add existing persistent server posts first
          globalPosts.forEach((p: any) => postMap.set(p.id, p));

          // 2. Merge incoming posts from device
          body.posts.forEach((incoming: any) => {
            const existing = postMap.get(incoming.id);
            if (!existing) {
              postMap.set(incoming.id, incoming);
            } else {
              const commentMap = new Map();
              (existing.comments || []).forEach((c: any) => commentMap.set(c.id, c));
              (incoming.comments || []).forEach((c: any) => commentMap.set(c.id, c));

              postMap.set(incoming.id, {
                ...existing,
                ...incoming,
                likes: Math.max(existing.likes || 0, incoming.likes || 0),
                comments: Array.from(commentMap.values()),
              });
            }
          });

          const mergedPosts = Array.from(postMap.values());
          sortPosts(mergedPosts);
          globalPosts = mergedPosts.slice(0, 50);
        }
      }

      if (body && Array.isArray(body.marketItems)) {
        const marketMap = new Map();
        globalMarketItems.forEach((m: any) => marketMap.set(m.id, m));
        body.marketItems.forEach((m: any) => marketMap.set(m.id, m));
        globalMarketItems = Array.from(marketMap.values()).slice(0, 50);
      }

      // Save updated state to persistent cloud DB
      await saveToPersistentCloud(globalPosts, globalMarketItems);

      return res.status(200).json({
        success: true,
        posts: globalPosts,
        marketItems: globalMarketItems,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
