import { assert } from "chai";
import sinon from "sinon";
import { html, render as litRender } from "../../src/js/terceros/lit-html.js";
import { carritoState } from "../../src/boundary/cart/carritoState.js";

import "../../src/boundary/navBar/navbar.js";

describe("NavBar", () => {
    let navBar;
    let shadowRoot;

    beforeEach(() => {
        navBar = document.createElement("nav-bar");
        document.body.appendChild(navBar);
        shadowRoot = navBar.shadowRoot ?? navBar._root;
    });

    afterEach(() => {
        sinon.restore();
        navBar.remove();
    });

    it("connectedCallback debe suscribirse al carritoState al conectarse", () => {
        const spySubscribe = sinon.spy(carritoState, "subscribe");
        navBar.connectedCallback();
        assert.isTrue(spySubscribe.calledOnce);
    });


    it("buttonAbrir debe cambiar el display de menuAbierto y elimnar el carrito de la vista al hacer click en buttonAbrir", () => {
        navBar.buttonAbrir();
        assert.isTrue(navBar.menuAbierto);
        const cartLi = shadowRoot.querySelector("#cartLi");
        assert.strictEqual(cartLi.style.display, "none");
    });

    it("buttonCerrar debe cambiar el display de menuAbierto y agregar el carrito de la vista  al hacer click en buttonCerrar", () => {
        navBar.menuAbierto = true;
        navBar.buttonCerrar();
        assert.isFalse(navBar.menuAbierto);
        const cartLi = shadowRoot.querySelector("#cartLi");
        assert.strictEqual(cartLi.style.display, "block");
    });


    it("inicionCLick debe emitir el evento 'inicioClick' al invocar inicionCLick()", () => {
        const spyDispatch = sinon.spy(navBar, "dispatchEvent");
        navBar.inicionCLick();
        assert.isTrue(spyDispatch.calledOnce);
        assert.strictEqual(spyDispatch.firstCall.args[0].type, "inicioClick");
    });

    it("menuClick debe emitir el  evento 'menuClick' al invocar MenuCLick()", () => {
        const spyDispatch = sinon.spy(navBar, "dispatchEvent");
        navBar.MenuCLick();
        assert.isTrue(spyDispatch.calledOnce);
        assert.strictEqual(spyDispatch.firstCall.args[0].type, "menuClick");
    });

    it("contactoClick debe emitir el  evento 'contactoClick' al invocar contactoClick()", () => {
        const spyDispatch = sinon.spy(navBar, "dispatchEvent");
        navBar.contactoClick();
        assert.isTrue(spyDispatch.calledOnce);
        assert.strictEqual(spyDispatch.firstCall.args[0].type, "contactoClick");
    });

    it("cartClick debe emitir el  evento 'cartClick' al invocar cartClick()", () => {
        const spyDispatch = sinon.spy(navBar, "dispatchEvent");
        navBar.cartClick();
        assert.isTrue(spyDispatch.calledOnce);
        assert.strictEqual(spyDispatch.firstCall.args[0].type, "cartClick");
        const eventDetail = spyDispatch.firstCall.args[0].detail;
        assert.strictEqual(eventDetail.element, "cart");
    });


    it("productoAgregado debe mostrar advertencia si _carrito no existe", () => {
        const warnStub = sinon.stub(console, "warn");
        navBar._carrito = null;
        navBar.productoAgregado({ nombre: "Pizza" });
        assert.isTrue(warnStub.calledOnce);
        assert.include(warnStub.firstCall.args[0], "No se encontró el carrito");
    });

    it("render debe colocar el contenido en el shadow DOM", () => {
        navBar.render();
        const botonMenu = shadowRoot.querySelector("#menu-button-abrir");
        assert.exists(botonMenu);
        const carrito = shadowRoot.querySelector("#cartCard");
        assert.exists(carrito);
    });
});
