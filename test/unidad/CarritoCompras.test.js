import { assert } from "chai";
import sinon from "sinon";
import { html, render as litRender } from "../../src/js/terceros/lit-html.js";
import { carritoState } from "../../src/boundary/cart/carritoState.js";

import "../../src/boundary/cart/carritoCompras.js";

describe("CarriroCompras", () => {
    let carrito;
    let shadowRoot;

    beforeEach(() => {
        carrito = document.createElement("carrito-compras");
        document.body.appendChild(carrito);
        shadowRoot = carrito.shadowRoot ?? carrito._root;
        carritoState.productos = [];
        carritoState.combos = [];
    });

    afterEach(() => {
        sinon.restore();
        carrito.remove();
    });

    it("connectedCallback: debe suscribirse al carritoState y llamar a render", () => {
        const spySubscribe = sinon.spy(carritoState, "subscribe");
        const spyRender = sinon.spy(carrito, "render");
        carrito.connectedCallback();
        assert(spySubscribe.calledOnce, "subscribe debería llamarse una vez");
        assert(spyRender.calledOnce, "render debería llamarse una vez");
    });

    it("disconnectedCallback: debe desuscribirse del carritoState", () => {
        const spyUnsubscribe = sinon.spy(carritoState, "unsubscribe");
        carrito._onCarritoChange = () => { };
        carrito.disconnectedCallback();
        assert(spyUnsubscribe.calledOnce, "unsubscribe debería llamarse una vez");
    });

    it("render: debe renderizar mensaje si no hay productos ni combos", () => {
        carritoState.setCombos([]);
        carritoState.setProductos([]);
        carrito.render();
        const mensaje = shadowRoot.querySelector("p");
        assert.exists(mensaje, "Debería existir un mensaje");
        assert.include(mensaje.textContent, "No has seleccionado ningún producto");
    });

    it("render: debe renderizar productos y combos cuando existen", () => {
        carritoState.setCombos([{ nombre: "Combo 1", precio: 15, cantidad: 2, url: "combo.png" }]);
        carritoState.setProductos([{ nombre: "Pizza", precio: 10, cantidad: 1, url: "pizza.png" }])
        carrito.render();
        const productos = shadowRoot.querySelectorAll(".producto");
        assert.strictEqual(productos.length, 2, "Debería haber 2 elementos con clase .producto");
    });

    it("pagoDeArticulos: debe despachar evento clientePago con productos y combos", (done) => {

        carrito.addEventListener("clientePago", (evento) => {
            assert.ok(evento, "Debe recibir un evento");
            assert.equal(evento.type, "clientePago", "El tipo de evento debe ser clientePago");
            done();
        });
        carrito.pagoDeArticulos();
    });
});
