const CACHE_NAME = "manoelerp-v1"

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

  "./data/produtos.js",
  "./data/vendas.js",
  "./data/materiaPrima.js",
  "./data/fabricacoes.js",
  "./data/receitas.js",
  "./data/clientes.js"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})