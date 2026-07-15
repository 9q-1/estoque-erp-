// Service Worker do Estoque ERP.
// Estratégia:
//  - Assets estáticos do build (_next/static/*, ícones, manifest) → cache-first
//    (são versionados/hasheados pelo Next.js, então nunca ficam desatualizados).
//  - Navegação (páginas) e chamadas de API (/api/*) → network-first, com fallback
//    para cache (páginas já visitadas) ou para /offline.html quando não há nada
//    em cache e não há conexão. Isso evita mostrar dados de estoque desatualizados
//    como se fossem atuais, mas garante que o app abre mesmo sem internet.

const VERSAO_CACHE = 'estoque-erp-v2';
const CACHE_ESTATICO = `${VERSAO_CACHE}-estatico`;
const CACHE_PAGINAS = `${VERSAO_CACHE}-paginas`;

const ARQUIVOS_ESSENCIAIS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ESTATICO).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(
        chaves
          .filter((chave) => chave.startsWith('estoque-erp-') && chave !== CACHE_ESTATICO && chave !== CACHE_PAGINAS)
          .map((chave) => caches.delete(chave))
      )
    )
  );
  self.clients.claim();
});

function ehAssetEstatico(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/splash/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/apple-touch-icon.png'
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // nunca cachear POST/PUT/DELETE (movimentações, login etc.)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Assets estáticos do build: cache-first (imutáveis por versão de deploy).
  if (ehAssetEstatico(url)) {
    event.respondWith(
      caches.match(request).then(
        (cacheado) =>
          cacheado ||
          fetch(request).then((resposta) => {
            const copia = resposta.clone();
            caches.open(CACHE_ESTATICO).then((cache) => cache.put(request, copia));
            return resposta;
          })
      )
    );
    return;
  }

  // Navegação de página (abrir/recarregar uma rota do app): network-first.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE_PAGINAS).then((cache) => cache.put(request, copia));
          return resposta;
        })
        .catch(async () => {
          const cacheado = await caches.match(request);
          return cacheado || caches.match('/offline.html');
        })
    );
    return;
  }

  // Chamadas de API: network-first, sem fallback de cache (dados de estoque
  // precisam ser sempre atuais; melhor falhar explicitamente do que mostrar
  // saldo/contagem desatualizados sem o usuário perceber).
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => new Response(null, { status: 503, statusText: 'Offline' })));
    return;
  }
});
