import { html, render } from "../../js/terceros/lit-html.js";

class ZonaPago extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._listaProductos = [
      {
        nombre: "combo amigos",
        idCombo: 1,
        url: "https://imag.bonviveur.com/pupusas-salvadorenas.webp",
        precio: 12.5,
      },
    ];
    this._listaCombos = [];
  }
  connectedCallback() {
    this._listaProductos = [];
    this._listaCombos = [];
    this.carritoCompras = document.createElement("carrito-compras");
    this.carritoCompras.classList.add("carritoCompras");
    this.carritoCompras.setAttribute("cssUtilizar", "ZonaPago");
    this.carritoCompras._listaProductos = this._listaProductos;
    this.carritoCompras._listaCombos = this._listaCombos;
    this.render();
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./boundary/ZonaPago/ZonaPago.css" />
    `;

    const plantilla = html`
      ${link}
      <h3>Articulos</h3>
      <div class="container">
        ${this.carritoCompras.render()} ${this.carritoCompras}

        <div class="resumen">
          <h3>Resumen</h3>
          <div class="info">
            <h3>Total:</h3>
            <p>
              ${[...this._listaProductos, ...this._listaCombos]
                .reduce((suma, item) => {
                  return suma + item.precio * (item.cantidad || 1);
                }, 0)
                .toFixed(2)}
            </p>
            <div class="button-container">
              <button>Pagar</button>
              <button>Volver</button>
            </div>
          </div>
        </div>
      </div>
    `;

    render(plantilla, this._root);
  }

  //   productoAgregado(producto) {
  //     if (this.carritoCompras) {
  //       //   this.carritoCompras.agregarItemProductoCartCard(producto);
  //       render();
  //     } else {
  //       console.warn("No se encontró el carrito.");
  //     }
  //   }

  //   comboAgregado(combo) {
  //     if (this.carritoCompras) {
  //       this.carritoCompras.agregarItemComboCartCard(combo);
  //       render();
  //     } else {
  //       console.warn("No se encontró el carrito.");
  //     }
  //   }

  actualizarListas() {
    this.carritoCompras._listaCombos = this._listaCombos;
    this.carritoCompras._listaProductos = this._listaProductos;
    this.render();
  }
}

customElements.define("zona-pago", ZonaPago);
