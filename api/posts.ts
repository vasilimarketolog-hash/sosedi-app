// Vercel Serverless Function for Sosedi.Online Multi-Device Real-Time Cloud Sync
let globalPosts: any[] = [];
let globalMarketItems: any[] = [];

export default async function handler(req: any, res: any) {
  // Allow CORS from any device / origin
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      posts: globalPosts,
      marketItems: globalMarketItems,
    });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      if (body && Array.isArray(body.posts)) {
        const getPostTime = (p: any): number => {
          if (!p || !p.id) return 0;
          const matches = p.id.match(/\d+/g);
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
        };

        if (body.isDelete) {
          const mergedPosts = [...body.posts];
          mergedPosts.sort((a: any, b: any) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return getPostTime(b) - getPostTime(a);
          });
          globalPosts = mergedPosts.slice(0, 50);
        } else {
          const postMap = new Map();

          // 1. Add existing global server posts first
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
          mergedPosts.sort((a: any, b: any) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return getPostTime(b) - getPostTime(a);
          });

          globalPosts = mergedPosts.slice(0, 50);
        }
      }

      if (body && Array.isArray(body.marketItems)) {
        const marketMap = new Map();
        globalMarketItems.forEach((m: any) => marketMap.set(m.id, m));
        body.marketItems.forEach((m: any) => marketMap.set(m.id, m));
        globalMarketItems = Array.from(marketMap.values()).slice(0, 50);
      }

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
