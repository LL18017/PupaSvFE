const CACHE_NAME = "PupaSv_tpi_info_app_v1";
const FILES_TO_CACHE = [
    "/css/main.css",
    "/css/assets/carrito-blanco.png",
    "/css/assets/cerrar-blanco.png",
    "/css/assets/facebook-blancoi.png",
    "/css/assets/instagram-blanco.png",
    "/css/assets/menu_blanco.png",
    "/css/assets/menu-blanco.png",
    "/css/assets/telefono-BLANCO.png",
    "/css/assets/whatapp-blanco.png",
    "/boundary/cart/carritoCompras.css",
    "/boundary/cart/carritoCompras.js",
    "/boundary/cart/carritoState.js",
    "/boundary/cart/ZonaPagoCarritoCompras.css",
    "/boundary/navBar/navBar.css",
    "/boundary/navBar/navbar.js",
    "/boundary/productos/producto.css",
    "/boundary/productos/Producto.js",
    "/boundary/ZonaPago/ZonaPago.css",
    "/boundary/ZonaPago/ZonaPago.js",
    "/serviceWorker.js",
    "/index.html",
    "/js/AppController.js",
    "/js/terceros/lit-html.js",
    "/control/ComboAccess.js",
    "/control/productoAccess.js",
    "/control/dataAccess.js",
    "/control/OrdenAccess.js",
    "/control/OrdenDetalleAccess.js",
    "/control/PagoAccess.js",
    "/control/PagoDetalleAccess.js",
    "/entity/Producto.js",
    "/entity/PagoDetalle.js",
    "/entity/Pago.js",
    "/entity/Orden.js"


];

// Instala y cachea recursos
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker] Cacheando recursos estáticos");
            return cache.addAll(FILES_TO_CACHE);
        })
            .catch(e => console.log(e)
            )
    );
});

// Activa y limpia versiones viejas del cache
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log("[Service Worker] Eliminando cache viejo:", key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    return self.clients.claim();
});

// Intercepta y responde con caché o red
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                // Si ya está cacheado, usarlo
                return cachedResponse;
            }

            return fetch(event.request)
                .then(networkResponse => {
                    // Si la petición fue exitosa, cachearla y devolverla
                    return caches.open(CACHE_NAME).then(cache => {
                        // Solo cachear si es una respuesta válida y segura
                        if (
                            event.request.method === "GET" &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // Si falla la red y no hay cache: devolver respuesta vacía para APIs
                    if (event.request.destination === "" && event.request.url.includes("/api/")) {
                        return new Response("[]", {
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    // También podrías devolver una página offline aquí si es HTML
                    if (event.request.headers.get("accept")?.includes("text/html")) {
                        return caches.match("/offline.html"); // Asegúrate de agregarla al cache
                    }

                    // Por defecto: nada
                    return new Response(null, { status: 204 });
                });
        })
    );
});

