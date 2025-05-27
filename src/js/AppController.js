import dataAccess from "../control/dataAccess.js";
import Interactividad from "./interactividad.js";
import { carritoState } from "../../boundary/cart/carritoState.js";

class AppController extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.mainTittle = document.getElementById("main-tittle");
    this.navBar = document.getElementById("nav-bar");
    this.productosContainer = document.getElementById("productos-container");
    this.info = document.getElementById("info");
    this.footer = document.getElementById("footer");
    this.ZonaPago = document.getElementById("ZonaPago");
    this.cartCard = document.getElementById("cartCard");
    this.pedidosCLiente = document.getElementById("pedidosCLiente");

    this.listaComponentes = [
      this.mainTittle,
      this.navBar,
      this.productosContainer,
      this.info,
      this.footer,
      this.ZonaPago,
      this.pedidosCLiente
    ];

    this.iniciarEventos();

    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker.register("../serviceWorker.js")
    //     .then(() => console.log("Service worker registrado"))
    //     .catch(e => console.warn(e));
    // }
  }

  iniciarEventos() {
    this.ZonaPago.style.display = "none";
    this.pedidosCLiente.style.display = "none";
    const { navBar, productosContainer, mainTittle, info, footer } = this;

    document.addEventListener("inicioClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar, this.info, this.mainTittle, this.footer,
      ]);
    });

    navBar.addEventListener("menuClick", () => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar, this.productosContainer, this.footer,
      ]);
      productosContainer.renderProductos();
    });

    navBar.addEventListener("contactoClick", () => {
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
      el.style.display = "block";
    });
  }


}

customElements.define("app-controller", AppController);
