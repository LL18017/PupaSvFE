import dataAccess from "../control/dataAccess.js";
import Interactividad from "./interactividad.js";
import { carritoState } from "../../boundary/cart/carritoState.js";

class AppController extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.productosContainer = document.getElementById("productos-container");
    this.footer = document.getElementById("footerComponent");
    this.ZonaPago = document.getElementById("ZonaPago");
    this.cartCard = document.getElementById("cartCard");
    this.pedidosCLiente = document.getElementById("pedidosCLiente");
    this.navBar = document.getElementById("nav-bar");
    this.main = document.getElementById("main-inicio");

    this.listaComponentes = [
      this.main,
      this.navBar,
      this.productosContainer,
      this.footer,
      this.ZonaPago,
      this.pedidosCLiente
    ];

    this.iniciarEventos();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("../serviceWorker.js")
        .then(() => console.log("Service worker registrado"))
        .catch(e => console.warn(e));
    }
  }

  iniciarEventos() {
    this.ZonaPago.style.display = "none";
    this.pedidosCLiente.style.display = "none";
    const { navBar, productosContainer, main, footer } = this;

    document.addEventListener("inicioClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar, this.main, this.footer,
      ]);
    });

    navBar.addEventListener("menuClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar, this.productosContainer, this.footer,
      ]);
      productosContainer.renderProductos();
    });

    navBar.addEventListener("contactoClick", () => {
      const footer = document.getElementById("footerComponent");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn("No se encontró el footer.");
      }
    });

    navBar.addEventListener("pepidoCLick", () => {
      this.pedidosCLiente.render();
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar, this.footer, this.pedidosCLiente,
      ]);
    });

    navBar.addEventListener("clientePago", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar, this.footer, this.ZonaPago,
      ]);
    });

    productosContainer.addEventListener("productoSeleccionado", (e) => {
      console.log(`Producto seleccionado: ${e.detail.nombre}, Precio: ${e.detail.precio}`);
      carritoState.agregarProducto(e.detail);
      if (this.navBar?.actualizarCardCart) {
        this.navBar.actualizarCardCart();
      }
    });

    productosContainer.addEventListener("comboSeleccionado", (e) => {
      console.log(`Combo seleccionado: ${e.detail.nombre}`);
      carritoState.agregarCombos(e.detail);
      if (this.navBar?.actualizarCardCart) {
        this.navBar.actualizarCardCart();
      }
    });
  }

  desaparecerElementos(listaElementos, listaExcepciones) {
    listaElementos.forEach((el) => {
      if (!listaExcepciones.includes(el)) {
        el.style.display = "none";
      }
    });
    listaExcepciones.forEach((el) => {
      console.log(el);

      el.style.display = "block";
    });
  }


}

customElements.define("app-controller", AppController);
