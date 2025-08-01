import { html, render } from "../../js/terceros/lit-html.js";
import { carritoState } from "../../boundary/cart/carritoState.js";
class NavBar extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this.menuAbierto = false;
    this._carrito;
    this._onCarritoChange = this.render.bind(this);
    this._onOrdenChange = this.renderCarrito.bind(this);
  }

  connectedCallback() {
    carritoState.subscribe(this._onCarritoChange); // Nos suscribimos a cambios
    carritoState.subscribe(this._onOrdenChange); // Nos suscribimos a cambios
    this.render();
  }

  disconnectedCallback() {
    carritoState.unsubscribe(this._onCarritoChange); // Limpiamos listener para evitar fugas de memoria
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

        <!-- Menú principal -->
        <ul id="menu-lista" class=${this.menuAbierto ? "mostrar" : "ocultar"}>
          <li @click=${() => this.inicionCLick()}>Inicio</li>
          <li @click=${() => this.MenuCLick()}>Menu</li>
          <li @click=${() => this.contactoClick()}>Contactos</li>
          <li @click=${() => this.pepidoCLick()}>Pedidos</li>
        </ul>

        <!-- Carrito separado del ul para evitar transform -->
        <div id="cartLi">
          <button id="boton-menu-cart" @click=${() => this.cartClick()}>
            <div class="cartCardContainer">
              <span id="numberCartCard"
                ><p id="number">${carritoState.getCantidadTotal()}</p></span
              >
              <img src="./css/assets/carrito-blanco.png" />
            </div>
            <carrito-compras id="cartCard"></carrito-compras>
          </button>
        </div>
      </div>
    `;

    render(plantilla, this._root);
    this._carrito = this._root.querySelector("#cartCard");
  }
  actualizarCardCart() {
    this._carrito.render();
    this.render();
  }

  buttonAbrir() {
    const cartElement = this._root.querySelector("#cartLi");
    if (cartElement) {
      cartElement.style.display = "none";
    }
    this.menuAbierto = true;
    this.render();
  }

  buttonCerrar() {
    const cartElement = this._root.querySelector("#cartLi");
    if (cartElement) {
      cartElement.style.display = "block";
    }
    this.menuAbierto = false;
    this.render();
  }

  inicionCLick() {
    this.buttonCerrar();
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
    this.buttonCerrar();
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

  pepidoCLick() {
    this.buttonCerrar();
    this.dispatchEvent(
      new CustomEvent("pepidoCLick", {
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
    this.buttonCerrar();
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
    this.buttonCerrar();
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
      this._carrito.agregarItemProductoCartCard(producto);
    } else {
      console.warn("No se encontró el carrito.");
    }
  }

  comboAgregado(combo) {
    if (this._carrito) {
      this._carrito.agregarItemComboCartCard(combo);
    } else {
      console.warn("No se encontró el carrito.");
    }
  }
  renderCarrito() {

  }

  renderCarrito() {
    const boton = this._root.querySelector("#boton-menu-cart");
    if (!boton) return;

    boton.classList.add("ondas");

    // Remueve la clase luego de 800 ms para permitir futuras animaciones
    setTimeout(() => {
      boton.classList.remove("ondas");
    }, 1000);
  }

}

customElements.define("nav-bar", NavBar);
