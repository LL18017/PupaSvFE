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
    "/css/assets/imagenMobile.png",
    "/css/assets/imagenGrande.png",
    "/boundary/cart/carritoCompras.css",
    "/boundary/cart/carritoCompras.js",
    "/boundary/cart/carritoState.js",
    "/boundary/cart/ZonaPagoCarritoCompras.css",
    "/boundary/inicio/Inicio.css",
    "/boundary/inicio/inicio.js",
    "/boundary/instalador/instalador.css",
    "/boundary/instalador/instalador.js",
    "/boundary/navBar/navBar.css",
    "/boundary/navBar/navbar.js",
    "/boundary/pedidos/pedidos.css",
    "/boundary/pedidos/Pedidos.js",
    "/boundary/piePag/Footer.css",
    "/boundary/piePag/footer.js",
    "/boundary/productos/producto.css",
    "/boundary/productos/Producto.js",
    "/boundary/ZonaPago/ZonaPago.css",
    "/boundary/ZonaPago/ZonaPago.js",
    "/control/ComboAccess.js",
    "/control/dataAccess.js",
    "/control/OrdenAccess.js",
    "/control/OrdenDetalleAccess.js",
    "/control/PagoAccess.js",
    "/control/PagoDetalleAccess.js",
    "/control/productoAccess.js",
    "/entity/Producto.js",
    "/entity/PagoDetalle.js",
    "/entity/Pago.js",
    "/entity/Orden.js",
    "/js/AppController.js",
    "/js/terceros/lit-html.js",
    "/serviceWorker.js",
    "/index.html",
    "/manifest.json"


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

self.addEventListener("fetch", event => {
    const url = event.request.url;

    // Excluir del cache las peticiones al backend
    if (url.startsWith("http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/")) {
        // Siempre usa la red para estas peticiones, sin cache
        return event.respondWith(fetch(event.request));
    }

    // Resto de peticiones: seguir usando caché
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
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
                    if (event.request.destination === "" && event.request.url.includes("/api/")) {
                        return new Response("[]", {
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    if (event.request.headers.get("accept")?.includes("text/html")) {
                        return caches.match("/offline.html");
                    }

                    return new Response(null, { status: 204 });
                });
        })
    );
});
