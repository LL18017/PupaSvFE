import { html, render } from "../../js/terceros/lit-html.js"
class Instalador extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({ mode: "open" });
        this.eventoInstalar = null;
        this.butonDescarga = document.createElement("button");
    }

    connectedCallback() {
        this.butonDescarga.id = "idDescargaApp";
        this.butonDescarga.innerText = "Descargar App";
        this.butonDescarga.disabled = true;
        this.butonDescarga.addEventListener("click", () => this.btnInstalar());

        // Escuchar el evento correcto
        window.addEventListener("beforeinstallprompt", (e) => this.antesInstalar(e));
        window.addEventListener("appInstalled", (e) => this.despuesInstalar());
        this.render()
    }

    antesInstalar(e) {
        e.preventDefault(); // Evita que el navegador muestre automáticamente el banner
        this.eventoInstalar = e;
        this._root.getElementById("idDescargaApp").disabled = false; // Habilita el botón de descarga
    }

    despuesInstalar() {
        this._root.getElementById("idDescargaApp").disabled = true;
        this.eventoInstalar = null;
        this.render();

    }

    async btnInstalar() {
        if (!this.eventoInstalar) return;

        this.eventoInstalar.prompt();
        const resultado = await this.eventoInstalar.userChoice;
        if (resultado.outcome === "accepted") {
            this.despuesInstalar()
        } else {
            console.log("Instalación cancelada");
        }

        this.eventoInstalar = null;
        this.butonDescarga.disabled = true;
        this.render()
    }

    render() {
        const link = html`<link rel="stylesheet" href="./boundary/instalador/instalador.css" />`;
        const plantilla = html`${link} ${this.butonDescarga}`;
        render(plantilla, this._root);
    }
}

customElements.define("instalador-app", Instalador);