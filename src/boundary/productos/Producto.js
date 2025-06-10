import ProductoAccess from "../../control/productoAccess.js";
import ComboAccess from "../../control/ComboAccess.js";
import { html, render } from "../../js/terceros/lit-html.js";

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
    this.elementosPorPagina = 10;

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
  aplicarFiltros() {
    this, this.cargando = true;
    this.errorMensaje = "";
    this, this.renderProductos();

    const textoBusquedaLower = this.textoBusqueda.toLowerCase();
    let dataFetchPromise;

    const ensureProductosMapReady = () => {
      if (this.allProductosData.length === 0) {
        return this.productoAccess.getData()
          .then(res => res.json())
          .then(productosResponse => {
            this.allProductosData = Array.isArray(productosResponse) ? productosResponse : [];
            this.productosMap = new Map(this.allProductosData.map((p) => [p.idProducto, p.nombre]));
          })
          .catch(error => {
            console.error("Error al cargar productos para el mapa:", error);
            this.errorMensaje = "Error al inicializar productos para el mapa.";
            return Promise.reject(error);
          });
      }
      return Promise.resolve();
    };

    dataFetchPromise = ensureProductosMapReady()
      .then(() => {
        return this._executeFilteringLogic(textoBusquedaLower);
      })
      .catch(error => {
        this.productos = [];
        this.combos = [];
        this.errorMensaje = this.errorMensaje || "Ocurrió un error inesperado al cargar los datos.";
        return Promise.reject(error);
      });

    dataFetchPromise
      .catch(error => {
        console.error("Error en la cadena principal de filtros:", error);
        this.productos = [];
        this.combos = [];
        this.errorMensaje = this.errorMensaje || "Ocurrió un error inesperado al cargar los datos.";
      })
      .finally(() => {
        this.cargando = false;
        this.renderProductos();
      });
  }

  // Método auxiliar para filtrado principal, devolviendo una Promesa
  _executeFilteringLogic(textoBusquedaLower) {
    return new Promise((resolve, reject) => {
      let totalRecordsCount = 0;
      let fetchPromise;

      if (this.filtroSeleccionado === "productos") {
        this.combos = [];

        const shouldFetchNewProducts =
          this.textoBusqueda !== this._lastProductoSearch ||
          this._lastFiltro !== "productos";

        if (shouldFetchNewProducts || (textoBusquedaLower === "" && this.allProductosData.length === 0)) {
          this.paginaActualProductos = 1;

          if (textoBusquedaLower === "") {
            fetchPromise = this.productoAccess.getData(
              undefined,
              (this.paginaActualProductos - 1) * this.elementosPorPagina,
              this.elementosPorPagina
            )
              .then(res => {
                const totalRecordsHeader = res.headers.get('Total-records');
                totalRecordsCount = totalRecordsHeader ? parseInt(totalRecordsHeader, 10) : 0;
                return res.json();
              })
              .then(data => {
                this.productos = Array.isArray(data) ? data : [];
                this.allProductosData = [];
              });
          } else {
            fetchPromise = this.productoAccess.getDataPorNombre(textoBusquedaLower)
              .then(searchResponse => {
                this.allProductosData = Array.isArray(searchResponse) ? searchResponse : [];
                totalRecordsCount = this.allProductosData.length;
                const inicio = (this.paginaActualProductos - 1) * this.elementosPorPagina;
                const fin = inicio + this.elementosPorPagina;
                this.productos = this.allProductosData.slice(inicio, fin);
              });
          }
          this._lastProductoSearch = this.textoBusqueda;
        } else {
          totalRecordsCount = this.allProductosData.length > 0 ? this.allProductosData.length : this.productos.length;
          const inicio = (this.paginaActualProductos - 1) * this.elementosPorPagina;
          const fin = inicio + this.elementosPorPagina;
          this.productos = this.allProductosData.slice(inicio, fin);
          fetchPromise = Promise.resolve();
        }
        if (fetchPromise) {
          fetchPromise
            .then(() => {
              this.totalPaginasProductos = Math.max(1, Math.ceil(totalRecordsCount / this.elementosPorPagina));
              if (totalRecordsCount === 0) this.totalPaginasProductos = 0;
              this._lastFiltro = "productos";
              resolve();
            })
            .catch(error => {
              console.error("Error al aplicar filtros de productos:", error);
              this.errorMensaje = "Ocurrió un error al cargar los productos.";
              reject(error);
            });
        } else {
          this.totalPaginasProductos = 0;
          this._lastFiltro = "productos";
          resolve();
        }

      } else if (this.filtroSeleccionado === "combos") {
        this.productos = [];

        const shouldFetchNewCombos =
          this.textoBusqueda !== this._lastComboSearch || this._lastFiltro !== "combos";

        if (shouldFetchNewCombos || this.allCombosData.length === 0) {
          this.paginaActualCombos = 1;
          if (textoBusquedaLower === "") {
            fetchPromise = this.comboAccess.getData().then(res => res.json());
          } else {
            fetchPromise = this.comboAccess.getDataPorNombre(textoBusquedaLower);
          }
          fetchPromise
            .then(response => {
              this.allCombosData = Array.isArray(response) ? response : [];
              this._lastComboSearch = this.textoBusqueda;

              totalRecordsCount = this.allCombosData.length;
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

              this.totalPaginasCombos = Math.max(1, Math.ceil(totalRecordsCount / this.elementosPorPagina));
              if (totalRecordsCount === 0) this.totalPaginasCombos = 0;
              this._lastFiltro = "combos";
              resolve();
            })
            .catch(error => {
              console.error("Error al aplicar filtros de combos:", error);
              this.errorMensaje = "Ocurrió un error al cargar los combos.";
              reject(error);
            });
        } else {
          totalRecordsCount = this.allCombosData.length;
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

          this.totalPaginasCombos = Math.max(1, Math.ceil(totalRecordsCount / this.elementosPorPagina));
          if (totalRecordsCount === 0) this.totalPaginasCombos = 0;
          this._lastFiltro = "combos";
          resolve();
        }
      } else {
        resolve();
      }
    });
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