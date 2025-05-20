import dataAccess from "../control/dataAccess.js";
import Interactividad from "./interactividad.js";

class AppController {
  constructor() {
    this.mainTittle = document.getElementById("main-tittle");
    this.navBar = document.getElementById("nav-bar");
    this.productosContainer = document.getElementById("productos-container");
    this.info = document.getElementById("info");
    this.footer = document.getElementById("footer");
    this.ZonaPago = document.getElementById("ZonaPago");
    this.cartCard = document.getElementById("cartCard");

    this.listaComponentes = [
      this.mainTittle,
      this.navBar,
      this.productosContainer,
      this.info,
      this.footer,
      this.ZonaPago,
    ];
    this.iniciarEventos();
    this.configurarBotonesPrueba();
  }

  iniciarEventos() {
    const { navBar, productosContainer, mainTittle, info, footer } = this;

    navBar.addEventListener("inicioClick", (e) => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar,
        this.info,
        this.mainTittle,
        this.footer,
      ]);
    });

    navBar.addEventListener("menuClick", (e) => {
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar,
        this.productosContainer,
        this.footer,
      ]);
      productosContainer.renderProductos();
    });
    navBar.addEventListener("contactoClick", (e) => {
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn("No se encontró el footer.");
      }
    });
    navBar.addEventListener("clientePago", (e) => {
      this.ZonaPago._listaProductos = e.detail.productos;
      this.ZonaPago._listaCombos = e.detail.combos;
      this.ZonaPago.actualizarListas();
      this.desaparecerElementos(this.listaComponentes, [
        this.navBar,
        this.footer,
        this.ZonaPago,
      ]);
    });

    // navBar.addEventListener("eliminarItemCart", () => navBar.itemEliminado());
    // navBar.addEventListener("agregarItemCart", () => navBar.itemAgregado());

    productosContainer.addEventListener("productoSeleccionado", (e) =>
      console.log(`Producto: ${e.detail.nombre}, Precio: ${e.detail.precio}`)
    );

    productosContainer.addEventListener("comboSeleccionado", (e) =>
      console.log(`Combo: ${e.detail.nombre}`)
    );

    ZonaPago.addEventListener("agregarItemCart", (e) => {
      if (e.detail.idProducto) {
        navBar._carrito.agregarItemProductoCartCard(e.detail);
      } else if (e.detail.idCombo) {
        navBar._carrito.agregarItemComboCartCard(e.detail);
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

  configurarBotonesPrueba() {
    this.configurarBotonProducto("botonProbarproducto1", {
      tipo: "producto",
      datos: {
        nombre: "coca",
        idProducto: 1,
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNKD4uQkcygT38Vm8luf2QrP84OpENDHcXOg&s",
        precio: 1.5,
      },
    });

    this.configurarBotonProducto("botonProbarproducto2", {
      tipo: "producto",
      datos: {
        nombre: "pupusa",
        idProducto: 2,
        url: "https://imag.bonviveur.com/pupusas-salvadorenas.webp",
        precio: 0.5,
      },
    });

    this.configurarBotonProducto("botonProbarcombo", {
      tipo: "combo",
      datos: {
        nombre: "combo amigos",
        idCombo: 1,
        url: "https://imag.bonviveur.com/pupusas-salvadorenas.webp",
        precio: 12.5,
      },
    });
  }

  configurarBotonProducto(idBoton, { tipo, datos }) {
    const boton = document.getElementById(idBoton);
    if (!boton) return;

    boton.addEventListener("click", () => {
      if (tipo === "producto") {
        this.navBar.productoAgregado(datos);
      } else if (tipo === "combo") {
        this.navBar.comboAgregado(datos);
      }
    });
  }
}

// Inicializar
new AppController();
