import ProductoAccess from "../../control/productoAccess.js";
import ComboAccess from "../../control/ComboAccess.js";
import { html, render } from "../../js/terceros/lit-html.js";

class Producto extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" }); // modo "open" para debug más fácil
    //PROPIEDADES
    this.productoAccess = new ProductoAccess();
    this.comboAccess = new ComboAccess();
    this.productos = [];
    this.combos = [];
    this.productosOriginales = [];
    this.CombosOriginales = [];
    this.textoBusqueda = "";
    this.filtroSeleccionado = "todos";
  }

  //
  connectedCallback() {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "./boundary/productos/producto.css");

    this._root.appendChild(link);

    this.getDataProductos();
    this.getDataCombo();
    this.eventoEnter();
    this.eventoclickLista(
      "elementoSeleccionado",
      this.handleElementoSeleccionado
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      "elementoSeleccionado",
      this.handleElementoSeleccionado
    ); // Agregado
  }

  handleElementoSeleccionado(event) {
    console.log("Evento elementoSeleccionado recibido:", event.detail);
  }

  getDataProductos() {
    this.productoAccess
      .getData()
      .then((response) => response.json())
      .then((productos) => {
        this.productos = productos || [];
        this.productosOriginales = [...this.productos];
        this.renderProductos();
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
        this.productos = [];
        this.productosOriginales = [];
        this.renderProductos();
      });
  }
  getDataCombo() {
    this.comboAccess
      .getData()
      .then((response) => response.json())
      .then((combos) => {
        this.combos = combos || [];
        this.combosOriginales = [...this.combos];
        this.renderCombos();
      })
      .catch((error) => {
        console.error("Error al obtener los combos:", error);
        this.combos = [];
        this.combosOriginales = [];
        this.renderCombos();
      });
  }

  //metodo que se debe selecionar para renderizar productos basicos
  renderProductos() {
    render(this.templateProductosYCombos(), this._root);
  }

  //metodo que se debe selecionar para renderizar combos basicos
  renderCombos() {
    render(this.templateProductosYCombos(), this._root);
  }

  //filtrar por nombre
  filtrarPorTipoYNombre(filtro) {
    const textoBusqueda = this.textoBusqueda.toLowerCase();
    this.textoBusqueda = textoBusqueda; // Corregido: this.textoBusqueda
    this.filtroSeleccionado = filtro;
  }

  //metodo para buscar por nombre para  renderizar combos y prodcutos por nombre
  filtrarBusqueda(e) {
    const textoBusqueda = e.target.value.toLowerCase();
    this.textoBusqueda = textoBusqueda;
    if (
      textoBusqueda != "" &&
      this.filtroSeleccionado.toLocaleLowerCase() === "productos"
    ) {
      this.combos = [];
      this.productoAccess
        .getDataPorNombre(this.textoBusqueda)
        .then((productos) => {
          this.productos = productos || [];
          this.productosOriginales = [...this.productos];
          this.renderProductos();
        })
        .catch((error) => {
          console.error("Error al obtener los productos:", error);
          this.productos = [];
          this.productosOriginales = [];
          this.renderProductos();
        });
    } else if (
      textoBusqueda != "" &&
      this.filtroSeleccionado.toLocaleLowerCase() === "combos"
    ) {
      this.productos = [];
      this.comboAccess
        .getDataPorNombre(this.textoBusqueda)
        .then((combos) => {
          this.combos = combos || [];
          this.combosOriginales = [...this.combos];
          this.renderCombos();
        })
        .catch((error) => {
          console.error("Error al obtener los productos:", error);
          this.combos = [];
          this.combosOriginales = [];
          this.renderCombos();
        });
    } else if (
      textoBusqueda == "" &&
      this.filtroSeleccionado.toLocaleLowerCase() === "productos"
    ) {
      this.combos = [];
      this.getDataProductos();
      this.renderProductos();
    } else if (
      textoBusqueda == "" &&
      this.filtroSeleccionado.toLocaleLowerCase() === "combos"
    ) {
      this.productos = [];
      this.getDataCombo();
      this.renderCombos();
    }
  }

  // Método que retorna la plantilla combinada de productos y combos
  templateProductosYCombos() {
    return html`
      <div class="busqueda-container">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          @input="${(e) => this.almacenarValorBusqueda(e)}"
        />
        <select @change="${(e) => this.filtrarPorTipoYNombre(e.target.value)}">
          <option
            value="todos"
            ?selected=${this.filtroSeleccionado === "todos"}
          >
            Todos
          </option>
          <option
            value="productos"
            ?selected=${this.filtroSeleccionado === "productos"}
          >
            Productos
          </option>
          <option
            value="combos"
            ?selected=${this.filtroSeleccionado === "combos"}
          >
            Combos
          </option>
        </select>
      </div>
      <!-- Sección de productos -->
      <section>
        ${this.productos.length === 0
          ? html`<div class="list-producto-container">
              No hay productos disponibles.
            </div>`
          : html`
              <h1>Productos</h1>
              <div class="list-producto-container">
                ${this.productos.map((producto) =>
                  this.crearTarjetaProducto(producto)
                )}
              </div>
            `}
      </section>

      <!-- Sección de combos -->
      <section>
        ${this.combos.length === 0
          ? html`<div class="list-combo-container">
              No hay combos disponibles.
            </div>`
          : html`
              <h1>Combos</h1>
              <div class="list-combo-container">
                ${this.combos.map((combo) => this.crearTarjetaCombo(combo))}
              </div>
            `}
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
        nombre: combo.nombre,
        url: combo.url,
      },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(evento);
  }
  almacenarValorBusqueda(e) {
    this.textoBusqueda = e.target.value;
  }

  seleccionarfiltro(e) {
    this.filtroSeleccionado = e.target.value;
    // this.filtrarPorTipoYNombre(this.filtroSeleccionado);
  }

  eventoEnter() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.filtrarBusqueda({ target: { value: this.textoBusqueda } });
      }
    });
  }
  eventoclickLista(event, item) {
    const eventoSeleccion = new CustomEvent("elementoSeleccionado", {
      detail: {
        tipo: item.productoPrecioList ? "producto" : "combo",
        item: item,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(eventoSeleccion);
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
