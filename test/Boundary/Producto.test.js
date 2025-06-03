import ProductoAccess from "../../src/control/productoAccess.js";
import ComboAccess from "../../src/control/ComboAccess.js";
import { html, render } from "../../src/js/terceros/lit-html.js";

class Producto extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.productoAccess = new ProductoAccess();
    this.comboAccess = new ComboAccess();

    // Arrays para los datos actuales y todos los datos
    this.productos = []; 
    this.combos = []; 
    this.allProductosData = []; 
    this.allCombosData = []; 

    this.textoBusqueda = "";
    this.filtroSeleccionado = "productos"; 
    this.productosMap = new Map();
    this.cargando = false; 

    // Propiedades para la paginación
    this.paginaActualProductos = 1;
    this.totalPaginasProductos = 1;
    this.paginaActualCombos = 1;
    this.totalPaginasCombos = 1;
    this.elementosPorPagina = 5;

    this._lastProductoSearch = "";
    this._lastComboSearch = "";
    this._lastFiltro = "";
  }

  connectedCallback() {
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "./boundary/productos/producto.css");
    this._root.appendChild(link);

    this.aplicarFiltros();
    this.eventoEnter();
  }

  // --- Métodos de Renderizado ---
  renderProductos() {
    render(this.templateProductosYCombos(), this._root);
  }

  // --- Metodo para filtrado ---
async aplicarFiltros() {
    this.cargando = true;
    this.renderProductos(); // Muestra el spinner de carga inmediatamente

    const textoBusquedaLower = this.textoBusqueda.toLowerCase();

    try {
      if (this.filtroSeleccionado === "productos") {
        let responseData = []; 
        let totalRecordsCount = 0;
        if (this.textoBusqueda !== this._lastProductoSearch || this._lastFiltro !== "productos") {
            this.allProductosData = []; // Asegurarse de que se recargue
            this.paginaActualProductos = 1; // Resetear la página si la búsqueda/filtro cambia
        }

        if (textoBusquedaLower === "") {
            const res = await this.productoAccess.getData(
                undefined,
                (this.paginaActualProductos - 1) * this.elementosPorPagina,
                this.elementosPorPagina
            );
            const totalRecordsHeader = res.headers.get('Total-records');
            if (totalRecordsHeader) {
                totalRecordsCount = parseInt(totalRecordsHeader, 10);
            }
            responseData = await res.json();
            this.productos = Array.isArray(responseData) ? responseData : []; 
            this.allProductosData = []

        } else {
            if (this.allProductosData.length === 0 || this.textoBusqueda !== this._lastProductoSearch) {
                const searchResponse = await this.productoAccess.getDataPorNombre(textoBusquedaLower);
                this.allProductosData = Array.isArray(searchResponse) ? searchResponse : [];
            }
            totalRecordsCount = this.allProductosData.length;
            const inicio = (this.paginaActualProductos - 1) * this.elementosPorPagina;
            const fin = inicio + this.elementosPorPagina;
            this.productos = this.allProductosData.slice(inicio, fin);
        }

        this.totalPaginasProductos = Math.ceil(totalRecordsCount / this.elementosPorPagina);
        if (this.totalPaginasProductos === 0 && totalRecordsCount > 0) {
            this.totalPaginasProductos = 1; 
        } else if (this.totalPaginasProductos === 0 && totalRecordsCount === 0) {
            this.totalPaginasProductos = 0; 
        }

        this._lastProductoSearch = this.textoBusqueda;
        this._lastFiltro = "productos";

        if (this.allProductosData.length === 0 && textoBusquedaLower === "") { 
            const productosResponse = await this.productoAccess.getData().then((res) => res.json());
            this.allProductosData = Array.isArray(productosResponse) ? productosResponse : [];
        }
        this.productosMap = new Map(this.allProductosData.map((p) => [p.idProducto, p.nombre]));
        this.combos = []; // Asegurarse de limpiar los combos si estamos en productos

      } else if (this.filtroSeleccionado === "combos") {
        
        if (this.allProductosData.length === 0 || this._lastFiltro !== "productos") { 
            const productosResponse = await this.productoAccess.getData().then((res) => res.json());
            this.allProductosData = Array.isArray(productosResponse) ? productosResponse : [];
            this.productosMap = new Map(this.allProductosData.map((p) => [p.idProducto, p.nombre]));
        }

        if (this.allCombosData.length === 0 || this.textoBusqueda !== this._lastComboSearch || this._lastFiltro !== "combos") {
            let response;
            if (textoBusquedaLower === "") {
                response = await this.comboAccess.getData().then((res) => res.json());
            } else {
                response = await this.comboAccess.getDataPorNombre(textoBusquedaLower);
            }
            this.allCombosData = Array.isArray(response) ? response : [];
            this._lastComboSearch = this.textoBusqueda;
            this._lastFiltro = "combos";
        }
        this.totalPaginasCombos = Math.ceil(this.allCombosData.length / this.elementosPorPagina);
        const inicio = (this.paginaActualCombos - 1) * this.elementosPorPagina;
        const fin = inicio + this.elementosPorPagina;

        this.combos = this.allCombosData.map((combo) => {
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
        }).slice(inicio, fin); 

        this.productos = []; 
      }
    } catch (error) {
      console.error("Error al aplicar filtros desde el servidor:", error);
      this.productos = [];
      this.combos = [];
      this.allProductosData = [];
      this.allCombosData = [];
    } finally {
      this.cargando = false;
      this.renderProductos();
    }
  }
  // ---Eventos ---

  almacenarValorBusqueda(e) {
    this.textoBusqueda = e.target.value;
    this.paginaActualProductos = 1;
    this.paginaActualCombos = 1;
    this.allProductosData = []; 
    this.allCombosData = []; 
    this.aplicarFiltros(); 
  }

  cambiarFiltro(e) {
    this.filtroSeleccionado = e.target.value;
    this.paginaActualProductos = 1;
    this.paginaActualCombos = 1;
    this.allProductosData = [];
    this.allCombosData = []; 
    this.aplicarFiltros();
  }

  paginaAnterior() {
    if (this.filtroSeleccionado === "productos" && this.paginaActualProductos > 1) {
      this.paginaActualProductos--;
      this.aplicarFiltros(); 
    } else if (this.filtroSeleccionado === "combos" && this.paginaActualCombos > 1) {
      this.paginaActualCombos--;
      this.aplicarFiltros(); 
    }
  }

  paginaSiguiente() {
    if (this.filtroSeleccionado === "productos" && this.paginaActualProductos < this.totalPaginasProductos) {
      this.paginaActualProductos++;
      this.aplicarFiltros();
    } else if (this.filtroSeleccionado === "combos" && this.paginaActualCombos < this.totalPaginasCombos) {
      this.paginaActualCombos++;
      this.aplicarFiltros();
    }
  }

  eventoEnter() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.aplicarFiltros();
      }
    });
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

  // --- Plantillas HTML ---
  templateProductosYCombos() {
    const paginaActual =
      this.filtroSeleccionado === "productos"
        ? this.paginaActualProductos
        : this.paginaActualCombos;
    const totalPaginas =
      this.filtroSeleccionado === "productos"
        ? this.totalPaginasProductos
        : this.totalPaginasCombos;

    return html`
      <div class="busqueda-container">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          .value="${this.textoBusqueda}"
          @keydown="${(e) => {
        if (e.key === 'Enter') {
          this.almacenarValorBusqueda(e);
        }
      }}"
        />
        <select @change="${this.cambiarFiltro.bind(this)}">
          <option value="productos" ?selected=${this.filtroSeleccionado === "productos"}>
            Productos
          </option>
          <option value="combos" ?selected=${this.filtroSeleccionado === "combos"}>
            Combos
          </option>
        </select>
      </div>
      ${this.cargando ? html`<div class="spinner">Cargando...</div>` : ''}

      <section style="display:${this.filtroSeleccionado === "combos" ? "none" : "block"}">
        <h1>Productos</h1>
        <div class="list-producto-container">
          ${this.productos.length === 0 && !this.cargando && this.totalPaginasProductos === 0
        ? html`<div class="no-disponible">No hay productos disponibles.</div>`
        : this.productos.map((producto) => this.crearTarjetaProducto(producto))}
        </div>
        ${this.totalPaginasProductos > 1 && !this.cargando
        ? html`
              <div class="paginacion-container">
                <button
                  @click="${this.paginaAnterior.bind(this)}"
                  ?disabled="${this.paginaActualProductos === 1}"
                >
                  Anterior
                </button>
                <span>Página ${this.paginaActualProductos} de ${this.totalPaginasProductos}</span>
                <button
                  @click="${this.paginaSiguiente.bind(this)}"
                  ?disabled="${this.paginaActualProductos === this.totalPaginasProductos}"
                >
                  Siguiente
                </button>
              </div>
            `
        : ''}
      </section>

      <section style="display:${this.filtroSeleccionado === "productos" ? "none" : "block"}">
        <h1>Combos</h1>
        <div class="list-combo-container">
          ${this.combos.length === 0 && !this.cargando && this.totalPaginasCombos === 0
        ? html`<div class="no-disponible">No hay combos disponibles.</div>`
        : this.combos.map((combo) => this.crearTarjetaCombo(combo))}
        </div>
        ${this.totalPaginasCombos > 1 && !this.cargando
        ? html`
              <div class="paginacion-container">
                <button
                  @click="${this.paginaAnterior.bind(this)}"
                  ?disabled="${this.paginaActualCombos === 1}"
                >
                  Anterior
                </button>
                <span>Página ${this.paginaActualCombos} de ${this.totalPaginasCombos}</span>
                <button
                  @click="${this.paginaSiguiente.bind(this)}"
                  ?disabled="${this.paginaActualCombos === this.totalPaginasCombos}"
                >
                  Siguiente
                </button>
              </div>
            `
        : ''}
      </section>
    `;
  }

  crearTarjetaProducto(producto) {
    return html`
      <div class="card">
        <div class="imagenContainer">
          <img class="imagenProducto" src="${producto.url}" alt="Imagen de ${producto.nombre}" />
        </div>
        <div class="info">
          <h3 class="info">Producto: ${producto.nombre}</h3>
          <p class="info">Precio: $${producto.productoPrecioList[0].precioSugerido.toFixed(2)}</p>
        </div>
        <button @click=${(e) => this.eventAgregarProducto(producto)} id="btnAgregar">
          Seleccionar
        </button>
      </div>
    `;
  }

  crearTarjetaCombo(combo) {
    return html`
      <div class="card">
        <div class="imagenContainer">
          <img class="imagenProducto" src="${combo.url}" alt="Imagen de ${combo.nombre}" />
        </div>
        <div class="info">
          <h3 class="info">Combo: ${combo.nombre}</h3>
          <p class="info">Descripción: ${combo.descripcion}</p>
          <p class="info">Precio: $${combo.precio.toFixed(2)}</p>
          ${combo.nombresProductosIncluidos && combo.nombresProductosIncluidos.length > 0
        ? html`<p class="info productos-incluidos">
                Incluye: ${combo.nombresProductosIncluidos.join(", ")}
              </p>`
        : ''}
        </div>
        <button @click=${(e) => this.eventAgregarCombo(combo)} id="btnAgregar">
          Seleccionar
        </button>
      </div>
    `;
  }
}
customElements.define("producto-plantilla", Producto);