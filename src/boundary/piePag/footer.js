import { html, render } from "../../js/terceros/lit-html.js";

class FooterComponent extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const plantilla = html`
      <link rel="stylesheet" href="./boundary/piePag/Footer.css" />
      <footer id="footer">
        <div class="footer-container">
          <div class="direccion">
            <p>
              Calle 5ª Avenida Sur, #123, Colonia El Palmar, Santa Ana, El Salvador.
            </p>
          </div>
          <div class="redes">
            <a href="#"><img src="./css/assets/facebook-blancoi.png" alt="Facebook" /></a>
            <a href="#"><img src="./css/assets/instagram-blanco.png" alt="Instagram" /></a>
            <a href="#"><img src="./css/assets/whatapp-blanco.png" alt="WhatsApp" /></a>
            <a href="#"><img src="./css/assets/telefono-BLANCO.png" alt="Teléfono" /></a>
          </div>
        </div>
      </footer>
    `;
    render(plantilla, this._root);
  }
}

customElements.define("footer-component", FooterComponent);
