// Service Worker for Sosedi.Online PWA
const CACHE_NAME = 'sosedi-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through cloud sync API calls directly to network
  if (event.request.url.includes('/api/') || event.request.url.includes('restful-api.dev')) {
    return;
  }
});
