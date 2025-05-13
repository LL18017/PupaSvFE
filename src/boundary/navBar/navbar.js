import { html, render } from "../../js/terceros/lit-html.js";

class NavBar extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "closed" });
    this.menuAbierto = false;
    this._carrito;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const link = html`
      <link rel="stylesheet" href="./boundary/navBar/navBar.css" />
    `;

    const plantilla = html`
      ${link}
      <div
        class="list-container"
        style=${this.menuAbierto
          ? "background-color: rgba(2, 2, 2, 0.7); height: 100vh;"
          : "background-color: var(--color--principal); height: 80px;"}
      >
        <button
          id="menu-button-cerrar"
          style=${this.menuAbierto ? "display: block" : "display: none"}
          @click=${() => this.buttonCerrar()}
        >
          <img src="./css/assets/cerrar-blanco.png" />
        </button>

        <button
          id="menu-button-abrir"
          style=${this.menuAbierto ? "display: none" : "display: block"}
          @click=${() => this.buttonAbrir()}
        >
          <img src="./css/assets/menu-blanco.png" />
        </button>

        <ul id="menu-lista" class=${this.menuAbierto ? "mostrar" : "ocultar"}>
          <li @click=${() => this.inicionCLick()}>Inicio</li>
          <li @click=${() => this.MenuCLick()}>Menu</li>
          <!-- <li @click=${() => this.deliveryCLick()}>Delivery</li> -->
          <li @click=${() => this.contactoClick()}>Contactos</li>
          <li>
            <button
              id="boton-menu-cart"
              style=${this.menuAbierto ? "display: none" : "display: block"}
              @click=${() => this.cartClick()}
            >
              <img src="./css/assets/carrito-blanco.png" />
              <carrito-compras id="cartCard"></carrito-compras>
            </button>
          </li>
        </ul>
      </div>
    `;

    render(plantilla, this._root);
    this._carrito = this._root.querySelector("#cartCard");
  }

  buttonAbrir() {
    this.menuAbierto = true;
    this.render();
  }

  buttonCerrar() {
    this.menuAbierto = false;
    this.render();
  }

  inicionCLick() {
    this.dispatchEvent(
      new CustomEvent("inicioClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonInicio",
          mensaje: "boton inicion clickeado",
          body: {},
        },
      })
    );
  }

  MenuCLick() {
    this.dispatchEvent(
      new CustomEvent("menuClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonMenu",
          mensaje: "boton menu clickeado",
          body: {},
        },
      })
    );
  }

  deliveryCLick() {
    this.dispatchEvent(
      new CustomEvent("deliveryClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonDelivery",
          mensaje: "boton delivery clickeado",
          body: {},
        },
      })
    );
  }

  contactoClick() {
    this.dispatchEvent(
      new CustomEvent("contactoClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "botonContacto",
          mensaje: "boton contacto clickeado",
          body: {},
        },
      })
    );
  }

  cartClick() {
    this.dispatchEvent(
      new CustomEvent("cartClick", {
        composed: true,
        bubbles: true,
        detail: {
          element: "cart",
          mensaje: "boton cart clickeado",
          body: {
            id: 1,
            nombre: "hola",
          },
        },
      })
    );
  }

  productoAgregado(producto) {
    if (this._carrito) {
      this._carrito.probar(producto);
    } else {
      console.warn("No se encontró el carrito.");
    }
  }
}

customElements.define("nav-bar", NavBar);
