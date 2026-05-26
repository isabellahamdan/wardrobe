const CACHE_NAME = 'wardrobe-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Handle share target
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  if (url.pathname === '/share-target' && e.request.method === 'POST') {
    e.respondWith((async () => {
      const formData = await e.request.formData();
      const title = formData.get('title') || '';
      const text = formData.get('text') || '';
      const sharedUrl = formData.get('url') || '';
      const mediaFile = formData.get('media');
      
      // Store shared data for the app to pick up
      const sharedData = { title, text, url: sharedUrl, timestamp: Date.now() };
      
      if (mediaFile) {
        const buffer = await mediaFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        sharedData.mediaBase64 = `data:${mediaFile.type};base64,${base64}`;
        sharedData.mediaType = mediaFile.type;
        sharedData.mediaName = mediaFile.name;
      }
      
      // Store in cache for app to retrieve
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/shared-data', new Response(JSON.stringify(sharedData)));
      
      // Redirect to app with inspiration tab open
      return Response.redirect('/?tab=inspiration&shared=1', 303);
    })());
  }
});
