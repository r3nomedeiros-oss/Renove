// Service Worker "kill-switch" — auto-remove e limpa qualquer cache antigo.
// O app de lançamentos precisa sempre da versão mais recente, sem cache offline.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => {
          try { client.navigate(client.url); } catch (e) {}
        });
      } catch (e) {
        // ignore
      }
    })()
  );
});

// Sempre buscar da rede (sem servir cache antigo)
self.addEventListener('fetch', (event) => {
  return;
});
