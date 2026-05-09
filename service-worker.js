const CACHE_NAME = "manoelerp-v5"

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./login.html",
  "./login.js",
  "./manifest.json",
  "./assets/logo.png",

  "./pages/produtos.html",
  "./pages/clientes.html",
  "./pages/vendas.html",
  "./pages/estoque.html",
  "./pages/relatorios.html",
  "./pages/materia-prima.html",
  "./pages/receitas.html",
  "./pages/fabricacao.html",
  "./pages/financeiro.html",

  "./data/produtos.js",
  "./data/vendas.js",
  "./data/materiaPrima.js",
  "./data/fabricacoes.js",
  "./data/receitas.js",
  "./data/clientes.js",
  "./data/financeiro.js"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE)
    })
  )

  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    })
  )
})