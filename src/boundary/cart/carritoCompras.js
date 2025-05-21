import { html, render } from "../../js/terceros/lit-html.js";
import { carritoState } from "./carritoState.js";

class CarriroCompras extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._onCarritoChange = this.render.bind(this);
  }
  connectedCallback() {
    carritoState.subscribe(this._onCarritoChange); // Nos suscribimos a cambios
    this.render();
  }
  disconnectedCallback() {
    carritoState.unsubscribe(this._onCarritoChange); // Limpiamos listener para evitar fugas de memoria
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
        ${carritoState.getProductos().length === 0 &&
        carritoState.getCombos().length === 0
          ? html`<p>No has seleccionado ningún producto</p>`
          : html`
              <div class="articulosContainer">
                ${carritoState.productos.map(
                  (p) => html`
                    <div class="producto">
                      <img src="${p.url}" />
                      <div class="info-container">
                        <p>producto: ${p.nombre}</p>
                        <p>precio: ${p.precio}</p>
                        <div class="contador-carrito">
                          <button
                            @click=${() => carritoState.eliminarProducto(p)}
                            class="boton-menos"
                          >
                            −
                          </button>
                          <span class="cantidad">${p.cantidad}</span>
                          <button
                            @click=${() => carritoState.agregarProducto(p)}
                            class="boton-mas"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  `
                )}
                ${carritoState.combos.map(
                  (p) => html`
                    <div class="producto">
                      <img src="${p.url}" />
                      <div class="info-container">
                        <p>combo: ${p.nombre}</p>
                        <p>precio: ${p.precio}</p>
                        <div class="contador-carrito">
                          <button
                            @click=${() => carritoState.eliminarCombos(p)}
                            class="boton-menos"
                          >
                            −
                          </button>
                          <span class="cantidad">${p.cantidad}</span>
                          <button
                            @click=${() => carritoState.agregarCombos(p)}
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
