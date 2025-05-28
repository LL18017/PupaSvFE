import ProductoAccess from "../../control/productoAccess.js";
import ComboAccess from "../../control/ComboAccess.js";
import { html, render } from "../../js/terceros/lit-html.js";

class Producto extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.productoAccess = new ProductoAccess();
    this.comboAccess = new ComboAccess();
    this.productos = [];
    this.combos = [];
    this.productosOriginales = []; // Copia completa de todos los productos
    this.combosOriginales = []; // Copia completa de todos los combos
    this.textoBusqueda = ""; // Almacena el texto actual de la barra de búsqueda
    this.filtroSeleccionado = "productos"; //"productos", "combos"
    this.prodcutosMap = new Map();
  }

  connectedCallback() {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "./boundary/productos/producto.css");

    this._root.appendChild(link);

    this.getDataProductos().then(() => {
      this.getDataCombo();
    })
    this.eventoEnter();
  }

  getDataProductos() {
    return this.productoAccess
      .getData()
      .then((response) => response.json())
      .then((productos) => {
        this.productos = productos || [];
        this.productosOriginales = [...this.productos]; // Guarda la copia original
        this.productosMap = new Map(
          this.productosOriginales.map((p) => [p.idProducto, p.nombre])
        );
        this.aplicarFiltros();
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
        this.productos = [];
        this.productosOriginales = [];
        this.aplicarFiltros();
      });
  }

  getDataCombo() {
    return this.comboAccess
      .getData()
      .then((response) => response.json())
      .then((combos) => {
        this.combos = combos || [];
        this.combosOriginales = this.combos.map((combo) => {
          const nombresProductosIncluidos = [];

          if (combo.comboDetalleList && Array.isArray(combo.comboDetalleList)) {
            combo.comboDetalleList.forEach((detalle) => {
              const productName = this.productosMap.get(detalle.idProducto);
              if (productName) {
                nombresProductosIncluidos.push(productName);
              }
            });
          }
          return { ...combo, nombresProductosIncluidos };
        });
        this.aplicarFiltros();
      })
      .catch((error) => {
        console.error("Error al obtener los combos:", error);
        this.combos = [];
        this.combosOriginales = [];
        this.aplicarFiltros();
      });
  }

  // Método para renderizar la plantilla (productos y combos)
  renderProductos() { // Este método ahora es más general, ya que renderiza ambos
    render(this.templateProductosYCombos(), this._root);
  }

  // Método central para aplicar todos los filtros (búsqueda por nombre y por tipo)
  aplicarFiltros() {
    const textoBusquedaLower = this.textoBusqueda.toLowerCase();

    let productosFiltradosPorBusqueda = this.productosOriginales.filter(
      (producto) =>
        producto &&
        producto.nombre &&
        producto.nombre.toLowerCase().includes(textoBusquedaLower)
    );

    let combosFiltradosPorBusqueda = this.combosOriginales.filter((combo) => {
      if (!combo || typeof combo !== "object" || !combo.nombre) {
        return false;
      }

      const comboNameLower = combo.nombre.toLowerCase();
      const comboDescriptionLower = (combo.descripcion || "").toString().toLowerCase();

      // Criterio 1: El texto de búsqueda está en el nombre del combo o en su descripción
      if (
        comboNameLower.includes(textoBusquedaLower) ||
        comboDescriptionLower.includes(textoBusquedaLower)
      ) {
        return true;
      }
      if (combo.nombresProductosIncluidos && Array.isArray(combo.nombresProductosIncluidos)) {
        return combo.nombresProductosIncluidos.some(productName =>
          productName && productName.toLowerCase().includes(textoBusquedaLower)
        );
      }

      return false;
    });

    if (this.filtroSeleccionado === "productos") {
      this.productos = productosFiltradosPorBusqueda;
      this.combos = [];
    } else if (this.filtroSeleccionado === "combos") {
      this.productos = [];
      this.combos = combosFiltradosPorBusqueda;
    } else {
      this.productos = productosFiltradosPorBusqueda;
      this.combos = combosFiltradosPorBusqueda;
    }

    this.renderProductos();
  }

  // Almacena el valor del input de búsqueda.
  almacenarValorBusqueda(e) {
    this.textoBusqueda = e.target.value;

  }

  // Cambia el tipo de filtro seleccionado y dispara el filtro unificado
  cambiarFiltro(e) {
    this.filtroSeleccionado = e.target.value;
    this.aplicarFiltros(); // Llama al método unificado para aplicar ambos filtros
  }

  // Método que retorna la plantilla combinada de productos y combos
  templateProductosYCombos() {
    return html`
      <div class="busqueda-container">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          .value="${this.textoBusqueda}" @input="${(e) => this.almacenarValorBusqueda(e)}"
        />
        <select @change="${this.cambiarFiltro.bind(this)}">
          <option value="productos" ?selected=${this.filtroSeleccionado === "productos"}>Productos</option>
          <option value="combos" ?selected=${this.filtroSeleccionado === "combos"}>Combos</option>
        </select>
      </div>
      <section>
        <h1>Productos</h1>
        <div class="list-producto-container">
          ${this.productos.length === 0
        ? html`<div class="no-disponible">No hay productos disponibles.</div>`
        : this.productos.map((producto) => this.crearTarjetaProducto(producto))
      }
        </div>
      </section>

      <section>
        <h1>Combos</h1>
        <div class="list-combo-container">
          ${this.combos.length === 0
        ? html`<div class="no-disponible">No hay combos disponibles.</div>`
        : this.combos.map((combo) => this.crearTarjetaCombo(combo))
      }
        </div>
      </section>
    `;
  }

  crearTarjetaProducto(producto) {
    return html`
      <div class="card">
        <div class="imagenContainer">
          <img class="imagenProducto" src="${producto.url}" />
        </div>
        <div class="info">
          <h3 class="info">producto: ${producto.nombre}</h3>
          <p class="info">
            precio: $${producto.productoPrecioList[0].precioSugerido}
          </p>
        </div>
        <button
          @click=${(e) => this.eventAgregarProducto(producto)}
          id="btnAgregar"
        >
          seleccionar
        </button>
      </div>
    `;
  }

  crearTarjetaCombo(combo) {
    return html`
      <div class="card">
        <div class="imagenContainer">
          <img class="imagenProducto" src="${combo.url}" />
        </div>
        <div class="info">
          <h3 class="info">combo: ${combo.nombre}</h3>
          <p class="info">descripcion: ${combo.descripcion}</p>
          <p class="info">precio: ${combo.precio}</p>
        </div>
        <button @click=${(e) => this.eventAgregarCombo(combo)} id="btnAgregar">
          seleccionar
        </button>
      </div>
    `;
  }

  eventAgregarProducto(producto) {
    const evento = new CustomEvent("productoSeleccionado", {
      detail: {
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        precio: producto.productoPrecioList[0].precioSugerido,
        url: producto.url,
      },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(evento);
  }

  eventAgregarCombo(combo) {
    const evento = new CustomEvent("comboSeleccionado", {
      detail: {
        idCombo: combo.idCombo,
        nombre: combo.nombre,
        precio: combo.precio,
        url: combo.url,
      },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(evento);
  }

  eventoEnter() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.aplicarFiltros(); // Llama al método unificado para aplicar ambos filtros
      }
    });
  }
}

customElements.define("producto-plantilla", Producto);

// async buttonPagar() {
//   this.cargando = true;
//   //orden a ejecuatar
//   const orden = new Orden(
//     null,
//     new Date().toISOString(),
//     this.sucursalSeleccionada,
//     false
//   );

//   // const response = await this.OrdenAccess.createData(orden);
//   // const locationHeader = response.headers.get("Location"); // e.g., "v1/orden/klo/123"
//   // const partes = locationHeader.split("/");
//   // const idOrden = partes[partes.length - 1];
//   const idOrden = 2;

//   // const productosPersistir = carritoState.getProductos().map((p) => ({
//   //   idProducto: p.idProducto,
//   //   cantidad: p.cantidad,
//   // }));

//   // const combosPersistir = carritoState.getCombos().map((c) => ({
//   //   idCombo: c.idCombo,
//   //   cantidad: c.cantidad,
//   // }));

//   // const responseOd = await this.OrdenDetalleAccess.createDataMix(
//   //   {
//   //     productList: productosPersistir,
//   //     comboList: combosPersistir,
//   //   },
//   //   idOrden
//   // );

//   //pago a ejecutar
//   // orden.idOrden = idOrden;
//   // const pago = new Pago(
//   //   null,
//   //   { idOrden: idOrden },
//   //   new Date().toISOString(),
//   //   this.formaPagoSeleccionada,
//   //   null
//   // );

//   // const response = await this.PagoAccess.createData(pago);
//   // const locationHeader = response.headers.get("Location"); // e.g., "v1/orden/klo/123"
//   // console.log(response);
//   // const partes = locationHeader.split("/");
//   // const idPago = partes[partes.length - 1];

//   console.log(this.pagosSeleccionados);

//   setTimeout(() => {
//     this.cargando = false;
//     // this.formaPagoSeleccionada = "";
//     // this.sucursalSeleccionada = "";
//     this.render();
//   }, 3000);
// }
