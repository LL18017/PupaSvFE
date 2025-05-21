import Orden from "../../entity/Orden.js";
import Pago from "../../entity/Pago.js";
import OrdenAccess from "../../control/OrdenAccess.js";
import PagoAccess from "../../control/PagoAccess.js";
import OrdenDetalleAccess from "../../control/OrdenDetalleAccess.js";
import { html, render } from "../../js/terceros/lit-html.js";
import { carritoState } from "../cart/carritoState.js";
class ZonaPago extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._onCarritoChange = this.render.bind(this);
    this.sucursales = [
      { id_sucursal: "sa", nombre: "Santa Ana" },
      { id_sucursal: "sa", nombre: "San Salvador" },
      { id_sucursal: "sm", nombre: "San Miguel" },
    ];
    this.formaPago = [
      { id_forma: "cash", nombre: "Efectivo" },
      { id_forma: "banco", nombre: "Transferencia Bancaria" },
      { id_forma: "tDeb", nombre: "Targeta Debito" },
      { id_forma: "tCred", nombre: "Targeta Credito" },
    ];
    this.sucursalSeleccionada = "";
    this.formaPagoSeleccionada = "";
    this.cargando = false;
    this.OrdenAccess = new OrdenAccess();
    this.PagoAccess = new PagoAccess();
    this.OrdenDetalleAccess = new OrdenDetalleAccess();
  }
  connectedCallback() {
    carritoState.subscribe(this._onCarritoChange); // Nos suscribimos a cambios
    this.render();
  }

  disconnectedCallback() {
    carritoState.unsubscribe(this._onCarritoChange); // Limpiamos listener para evitar fugas de memoria
  }

  render() {
    render(this.plantilla(), this._root);
  }

  plantilla() {
    return html`
      <link rel="stylesheet" href="./boundary/ZonaPago/ZonaPago.css" />
      <h3>Artículos</h3>
      ${this.cargando ? this.renderSpiner() : ""}
      <div class="container">
        <carrito-compras cssUtilizar="ZonaPago"></carrito-compras>
        ${this.renderResumen()}
      </div>
    `;
  }

  renderResumen() {
    return html`
      <div class="resumen">
        <h3>Resumen</h3>
        <div class="info">
          ${this.renderSelectorSucursal()} ${this.renderSelectorFormaPago()}
          ${this.renderDatosPagoAdicionales()}
          <h3>Total:</h3>
          <p>$${this.calcularTotal()}</p>
          <button
            ?disabled=${!this.puedePagar()}
            @click=${() => this.buttonPagar()}
          >
            Pagar
          </button>
          <button @click=${() => this.buttonVolver()}>Volver</button>
        </div>
      </div>
    `;
  }

  renderSelectorSucursal() {
    return html`
      <label for="selectSucursal">Sucursal:</label>
      <select
        id="selectSucursal"
        @change=${(e) => this.seleccionarSucursal(e)}
        .value=${this.sucursalSeleccionada}
      >
        <option value="">Seleccione una sucursal</option>
        ${this.sucursales.map(
          (s) => html`<option value="${s.id_sucursal}">${s.nombre}</option>`
        )}
      </select>
    `;
  }

  renderSelectorFormaPago() {
    return html`
      <label for="selectFormaPago">Forma de pago:</label>
      <select
        ?disabled=${this.sucursalSeleccionada === ""}
        id="selectFormaPago"
        @change=${(e) => this.seleccionarFormaPago(e)}
        .value=${this.formaPagoSeleccionada}
      >
        <option value="">Seleccione una forma de pago</option>
        ${this.formaPago.map(
          (f) => html`<option value="${f.id_forma}">${f.nombre}</option>`
        )}
      </select>
    `;
  }

  renderDatosPagoAdicionales() {
    if (this.formaPagoSeleccionada === "banco") {
      return html`
        <label for="numCuenta">Número de cuenta:</label>
        <input
          id="numCuenta"
          type="text"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          value="11112222333444"
        />
        <label for="nombreTitular">Nombre del titular:</label>
        <input id="nombreTitular" type="text" value="Mario Lopez" />
      `;
    } else if (
      this.formaPagoSeleccionada === "tDeb" ||
      this.formaPagoSeleccionada === "tCred"
    ) {
      return html`
        <label for="numTargeta">Número de cuenta:</label>
        <input
          id="numTargeta"
          type="text"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          value="1111222333444"
        />
        <label for="nombreTitular">Nombre del titular:</label>
        <input id="nombreTitular" type="text" value="mario lopez" />
        <label for="codigoCvc">CVC:</label>
        <input id="codigoCvc" type="password" value="123" />
      `;
    }
    return null;
  }

  renderSpiner() {
    return html` <div class="spinner-container">
      <div class="spinner"></div>
    </div>`;
  }

  calcularTotal() {
    const productos = [
      ...carritoState.getProductos(),
      ...carritoState.getCombos(),
    ];
    return productos
      .reduce((suma, item) => suma + item.precio * (item.cantidad || 1), 0)
      .toFixed(2);
  }

  puedePagar() {
    return (
      this.formaPagoSeleccionada !== "" && this.sucursalSeleccionada !== ""
    );
  }
  async buttonPagar() {
    this.cargando = true;
    //orden a ejecuatar
    const orden = new Orden(
      null,
      new Date().toISOString(),
      this.sucursalSeleccionada,
      false
    );

    // const response = await this.OrdenAccess.createData(orden);
    // const locationHeader = response.headers.get("Location"); // e.g., "v1/orden/klo/123"
    // const partes = locationHeader.split("/");
    // const idOrden = partes[partes.length - 1];
    const idOrden = 2;

    // const productosPersistir = carritoState.getProductos().map((p) => ({
    //   idProducto: p.idProducto,
    //   cantidad: p.cantidad,
    // }));

    // const combosPersistir = carritoState.getCombos().map((c) => ({
    //   idCombo: c.idCombo,
    //   cantidad: c.cantidad,
    // }));

    // const responseOd = await this.OrdenDetalleAccess.createDataMix(
    //   {
    //     productList: productosPersistir,
    //     comboList: combosPersistir,
    //   },
    //   idOrden
    // );

    //pago a ejecutar
    orden.idOrden = idOrden;
    const pago = new Pago(
      null,
      { idOrden: idOrden },
      new Date().toISOString(),
      this.formaPagoSeleccionada,
      null
    );

    const response = await this.PagoAccess.createData(pago);
    const locationHeader = response.headers.get("Location"); // e.g., "v1/orden/klo/123"
    console.log(response);
    const partes = locationHeader.split("/");
    const idPago = partes[partes.length - 1];

    console.log("el id pago es : " + idPago);

    setTimeout(() => {
      this.cargando = false;
      this.formaPagoSeleccionada = "";
      this.sucursalSeleccionada = "";
      this.render();
    }, 3000);
  }

  seleccionarSucursal(e) {
    this.sucursalSeleccionada = e.target.value;
    if (this.sucursalSeleccionada === "") {
      this.formaPagoSeleccionada = "";
    }
    this.renderSelectorFormaPago();
    this.render();
    // this.requestUpdate();
  }

  seleccionarFormaPago(e) {
    this.formaPagoSeleccionada = e.target.value;
    this.render();
    // this.requestUpdate();
  }

  buttonVolver() {
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

  formatearFecha(date) {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    const hora = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${año}-${mes}-${dia} ${hora}:${minutos}`;
  }
}

customElements.define("zona-pagos", ZonaPago);
