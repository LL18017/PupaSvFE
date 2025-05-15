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
  }

  //
  connectedCallback() {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "./boundary/productos/producto.css");

    this._root.appendChild(link);

    this.getDataProductos();
    this.getDataCombo();
  }

  getDataProductos() {
    this.productoAccess
      .getData()
      .then((response) => response.json())
      .then((productos) => {
        this.productos = productos || [];
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
        this.productos = [];
        // para mostrar error o vacío
      });
  }
  getDataCombo() {
    this.comboAccess
      .getData()
      .then((response) => response.json())
      .then((combos) => {
        this.combos = combos || [];
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
        this.combos = [];
        this.renderCombos(); // para mostrar error o vacío
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

   //metodo que se debe selecionar para renderizar productos nombre se debe setear los datos en this.productos

    //metodo que se debe selecionar para renderizar combos por nombre se debe setear los datos en this.productos


  // Método que retorna la plantilla combinada de productos y combos
  templateProductosYCombos() {
    return html`
      <!-- Sección de productos -->
      <section>
        ${this.productos.length === 0
          ? html`<div class="list-producto-container">
              No hay productos disponibles.
            </div>`
          : html`
              <div class="busqueda-container">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  @input="${(e) => this.filtrarBusqueda(e)}"
                />
              </div>

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
}

customElements.define("producto-plantilla", Producto);
