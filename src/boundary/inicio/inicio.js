import { html, render } from "../../js/terceros/lit-html.js";

class Inicio extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const plantilla = html`
      <link rel="stylesheet" href="./boundary/inicio/Inicio.css" />
        <header id="main-tittle">
          <img src="./css/assets/logo.png" alt="Logo PupaSv" class="logo-principal" />
        </header>
        <section id="info">
          <div class="logo-empresa">
            <p>
              Bienvenido a PupaSv, donde ofrecemos una buena comida, única experiencia
              con el sabor único de El Salvador. Si usted está aquí para un almuerzo o cena
              de negocios, celebrando una especial ocasión, o buscando un ambiente romántico
              para una cita, nuestro menú ofrece algo para todos.
            </p>
          </div>
        </section>
    `;
    render(plantilla, this._root);
  }
}
customElements.define("main-inicio", Inicio);
