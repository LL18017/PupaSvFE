import { html, render } from "../../js/terceros/lit-html.js";

class CarriroCompras extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._listaProductos = [];
    this._listaCombos = [];
  }
  connectedCallback() {
    this.render();
  }

  eliminarItemProductoCartCard(producto) {
    const index = this._listaProductos.findIndex(
      (p) => p.idProducto === producto.idProducto
    );

    if (index !== -1) {
      const existente = this._listaProductos[index];

      if (existente.cantidad > 1) {
        existente.cantidad -= 1;
      } else {
        // Eliminar el producto si la cantidad es 1 o menor
        this._listaProductos.splice(index, 1);
      }
    }

    this.render();
    this.dispatchEvent(
      new CustomEvent("eliminarItemCart", {
        composed: true,
        bubbles: true,
      })
    );
  }

  agregarItemProductoCartCard(producto) {
    const existente = this._listaProductos.find(
      (c) => c.idProducto === producto.idProducto
    );

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
      this._listaProductos.push({ ...producto, cantidad: 1 });
    }

    this.render();
    this.dispatchEvent(
      new CustomEvent("agregarItemCart", {
        composed: true,
        bubbles: true,
        detail: producto,
      })
    );
  }
  agregarItemComboCartCard(combo) {
    const existente = this._listaCombos.find(
      (c) => c.idCombo === combo.idCombo
    );

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
      this._listaCombos.push({ ...combo, cantidad: 1 });
    }
    this.render();
    this.dispatchEvent(
      new CustomEvent("agregarItemCart", {
        composed: true,
        bubbles: true,
        detail: combo,
      })
    );
  }

  eliminarItemComboCartCard(combo) {
    const index = this._listaCombos.findIndex(
      (c) => c.idCombo === combo.idCombo
    );
    if (index !== -1) {
      const existente = this._listaCombos[index];

      if (existente.cantidad > 1) {
        existente.cantidad -= 1;
      } else {
        this._listaCombos.splice(index, 1);
      }
    }
    this.render();
    this.dispatchEvent(
      new CustomEvent("eliminarItemCart", {
        composed: true,
        bubbles: true,
      })
    );
  }

  render() {
    const cssUtilizar = this.getAttribute("cssUtilizar");

    let cssPath = "./boundary/cart/carritoCompras.css";
    if (cssUtilizar === "ZonaPago") {
      cssPath = "./boundary/cart/ZonaPagoCarritoCompras.css";
    } else if (cssUtilizar === "carrito") {
      cssPath = "./boundary/cart/carritoCompras.css";
    }

    const link = html` <link rel="stylesheet" href=${cssPath} /> `;

    const plantilla = html`
      ${link}
      <div class="list-container">
        ${this._listaProductos.length === 0 && this._listaCombos.length === 0
          ? html`<p>No has seleccionado ningún producto</p>`
          : html`
              <div class="articulosContainer">
                ${this._listaProductos.map(
                  (p) => html`
                    <div class="producto">
                      <img src="${p.url}" />
                      <div class="info-container">
                        <p>producto: ${p.nombre}</p>
                        <p>precio: ${p.precio}</p>
                        <div class="contador-carrito">
                          <button
                            @click=${() => this.eliminarItemProductoCartCard(p)}
                            class="boton-menos"
                          >
                            −
                          </button>
                          <span class="cantidad">${p.cantidad}</span>
                          <button
                            @click=${() => this.agregarItemProductoCartCard(p)}
                            class="boton-mas"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  `
                )}
                ${this._listaCombos.map(
                  (p) => html`
                    <div class="producto">
                      <img src="${p.url}" />
                      <div class="info-container">
                        <p>combo: ${p.nombre}</p>
                        <p>precio: ${p.precio}</p>
                        <div class="contador-carrito">
                          <button
                            @click=${() => this.eliminarItemComboCartCard(p)}
                            class="boton-menos"
                          >
                            −
                          </button>
                          <span class="cantidad">${p.cantidad}</span>
                          <button
                            @click=${() => this.agregarItemComboCartCard(p)}
                            class="boton-mas"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  `
                )}
              </div>

              <button @click=${() => this.pagoDeArticulos()} id="btnCardPagar">
                pagar
              </button>
            `}
      </div>
    `;

    render(plantilla, this._root);
  }

  pagoDeArticulos() {
    this.dispatchEvent(
      new CustomEvent("clientePago", {
        composed: true,
        bubbles: true,
        detail: {
          productos: this._listaProductos,
          combos: this._listaCombos,
        },
      })
    );
  }
}

customElements.define("carrito-compras", CarriroCompras);
