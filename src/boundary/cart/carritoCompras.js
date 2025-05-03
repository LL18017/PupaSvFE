import { html, render } from "../../js/terceros/lit-html.js";

class CarriroCompras extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._listaProductos = [];
    this._listacombos = [];
  }
  connectedCallback() {
    this.render();
  }

  probar(producto) {
    this._listaProductos.push(producto);
    this.render();
  }
  render() {
    const link = html`
      <link rel="stylesheet" href="./src/boundary/cart/carritoCompras.css" />
    `;

    const plantilla = html`
      ${link}
      <div class="list-container">
        ${
          this._listaProductos.length === 0 && this._listacombos.length === 0
            ? html`<p>No has seleccionado ningún producto</p>`
            : html`
                <div class="producto">
                  <img src="${this._listaProductos[0].url}" />
                  <div class="info-container">
                    <p>producto:${this._listaProductos[0].nombre}</p>
                    <p>precio:${this._listaProductos[0].precio}</p>
                    <div class="contador-carrito">
                      <button class="boton-menos">−</button>
                      <span class="cantidad"
                        >${this._listaProductos[0].cantidad}</span
                      >
                      <button class="boton-mas">+</button>
                    </div>
                  </div>
                </div>
                <button id="btnCardPagar">pagar</button>
              `
        } </div>
          
      </div>
    `;
    render(plantilla, this._root);
  }
}

customElements.define("carrito-compras", CarriroCompras);
