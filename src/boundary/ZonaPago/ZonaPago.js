import Orden from "../../entity/Orden.js";
import Pago from "../../entity/Pago.js";
import OrdenAccess from "../../control/OrdenAccess.js";
import PagoAccess from "../../control/PagoAccess.js";
import OrdenDetalleAccess from "../../control/OrdenDetalleAccess.js";
import PagoDetalleAccess from "../../control/PagoDetalleAccess.js";
import { html, render } from "../../js/terceros/lit-html.js";
import { carritoState } from "../cart/carritoState.js";
import PagoDetalle from "../../entity/PagoDetalle.js";
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
    this.PagoDetalleAccess = new PagoDetalleAccess();
    this.pagosSeleccionados = [];
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

  // Estructura base de la plantilla HTML
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

  // Render del resumen de pago (formularios + botón pagar)
  renderResumen() {
    return html`
      <div class="resumen">
        <h3>Resumen</h3>
        <form onsubmit="event.preventDefault();" class="info">
          ${this.renderSelectorSucursal()} ${this.renderPagosMultiples()}

          <h3>Total:</h3>
          <p>$${this.calcularTotal()}</p>

          <button
            ?disabled=${!this.puedePagar()}
            @click=${() => this.buttonPagar()}
            type="submit"
          >
            Pagar
          </button>
          <button type="button" @click=${() => this.buttonVolver()}>
            Volver
          </button>
        </form>
      </div>
    `;
  }

  // Render del selector de sucursal
  renderSelectorSucursal() {
    return html`
      <label for="selectSucursal">Sucursal:</label>
      <select
        required
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

  // Al seleccionar una sucursal, se actualiza el estado
  seleccionarSucursal(e) {
    this.sucursalSeleccionada = e.target.value;
    if (this.sucursalSeleccionada === "");
    // this.renderSelectorFormaPago();
    this.render();
  }
  // Calcula el total del carrito
  calcularTotal() {
    const items = [...carritoState.getProductos(), ...carritoState.getCombos()];
    return items
      .reduce((suma, item) => suma + item.precio * (item.cantidad || 1), 0)
      .toFixed(2);
  }

  // Calcula el total pagado por los métodos seleccionados
  totalPagado() {
    return this.pagosSeleccionados.reduce(
      (sum, p) => sum + (parseFloat(p.cantidad) || 0),
      0
    );
  }
  // Verifica si se puede habilitar el botón de pagar
  puedePagar() {
    const total = parseFloat(this.calcularTotal());
    return (
      this.sucursalSeleccionada !== "" &&
      this.pagosSeleccionados.length > 0 &&
      Math.abs(this.totalPagado() - total) < 0.01
    );
  }

  // Renderiza los pagos múltiples con validación
  renderPagosMultiples() {
    if (!this.sucursalSeleccionada) return null;

    return html`
      ${this.pagosSeleccionados.map((pago, index) =>
        this.renderPagoIndividual(pago, index)
      )}
      <button type="button" @click=${() => this.agregarPago()}>
        Agregar pago
      </button>
      ${this.renderTotalPagado()}
    `;
  }

  // Renderiza un único selector de forma de pago y campos asociados
  renderPagoIndividual(pago, index) {
    return html`
      <label>Pago ${index + 1}:</label>
      <select
        required
        .value=${pago.forma}
        @change=${(e) => this.actualizarFormaPago(index, e)}
      >
        <option value="">Seleccione una forma de pago</option>
        ${this.formaPago.map(
          (f) => html`<option value="${f.id_forma}">${f.nombre}</option>`
        )}
      </select>
      ${this.renderDatosPagoAdicionales(pago.forma)}
      <label>Cantidad:</label>
      <div class="containeInputBtnEliminar">
        <input
          type="text"
          inputmode="decimal"
          placeholder="Cantidad"
          .value=${pago.cantidad ?? this.valorSugeridoParaPago(index)}
          ?disabled=${pago.forma === ""}
          @input=${(e) => this.actualizarCantidadPago(index, e)}
          @keydown=${this.validarInputDecimal}
        />
        <button
          class="btnEliminarSeccionPago"
          @click=${() => this.eliminarPago(index)}
        >
          x
        </button>
      </div>
    `;
  }

  // Renderiza el total pagado y validación visual
  renderTotalPagado() {
    if (!this.pagosSeleccionados.some((p) => p.forma !== "")) return null;

    const color =
      this.totalPagado().toFixed(2) !== Number(this.calcularTotal()).toFixed(2)
        ? "red"
        : "black";

    return html`
      <p style="color: ${color}">
        Total pagado: $${this.totalPagado().toFixed(2)}
      </p>
    `;
  }

  renderSelectorFormaPago() {
    return html`
      <label for="selectFormaPago">Forma de pago:</label>
      <select
        required
        ?disabled=${this.sucursalSeleccionada === ""}
        id="selectFormaPago"
        @change=${(e) => this.renderPagosMultiples(e)}
        .value=${this.formaPagoSeleccionada}
      >
        <option value="">Seleccione una forma de pago</option>
        ${this.formaPago.map(
          (f) => html`<option value="${f.id_forma}">${f.nombre}</option>`
        )}
      </select>
    `;
  }

  // Renderiza un spinner mientras se ejecuta el pago
  renderSpiner() {
    return html`<div class="spinner-container">
      <div class="spinner"></div>
    </div>`;
  }

  // Botón de pagar: ejecuta la orden + pagos

  async buttonPagar() {
    let orden = new Orden(
      null,
      new Date().toISOString(),
      this.sucursalSeleccionada,
      false
    );

    try {
      this.cargando = true;
      this.render(); // muestra el spinner
      await new Promise((r) =>
        setTimeout(() => {
          r();
        }, 1000)
      ); // Esperar 1 segundos

      orden = await this.crearOrden(orden);

      await this.crearOrdenDetalles(orden.idOrden);

      // creacion de pagos
      this.pagosSeleccionados.forEach(async (p) => {
        let pago = new Pago(
          null,
          { idOrden: orden.idOrden },
          new Date().toISOString(),
          p.forma,
          null
        );
        await this.crearPago(pago, p.cantidad);
      });

      alert("PAGO EXISTOSO");
      this.limpiar();
    } catch (error) {
      console.error("Error al procesar el pago:", error);
    } finally {
      this.cargando = false;
      this.render(); // oculta el spinner
    }
  }

  // Crea una nueva orden
  async crearOrden(orden) {
    try {
      const response = await this.OrdenAccess.createData(orden);
      const locationHeader = response.headers.get("Location"); // e.g., "v1/orden/klo/123"
      const partes = locationHeader.split("/");
      const idOrden = partes[partes.length - 1];
      orden.idOrden = idOrden;
      return orden;
    } catch (error) {
      alert("error al crear orden: " + error);
    }
  }

  // Crea una nuev pago
  async crearPago(pago, monto) {
    try {
      const response = await this.PagoAccess.createData(pago);
      const locationHeader = response.headers.get("Location"); // e.g., "v1/orden/klo/123"
      const partes = locationHeader.split("/");
      const idPago = partes[partes.length - 1];
      pago.idPago = idPago;
      //creacion de detalle
      await this.crearPagoDetalles(pago, monto);
      return pago;
    } catch (error) {
      alert("error al crear pago: " + error);
    }
  }
  // Crea los detalles para el pago
  async crearPagoDetalles(pago, cantidad) {
    try {
      let detalle = new PagoDetalle(null, pago, cantidad, null);
      await this.PagoDetalleAccess.createData(detalle, pago.idPago);
    } catch (error) {
      alert("error al crear detalles del pago: " + error);
    }
  }
  // Crea los detalles para la orden
  async crearOrdenDetalles(idOrden) {
    try {
      const productosPersistir = carritoState.getProductos().map((p) => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad,
      }));

      const combosPersistir = carritoState.getCombos().map((c) => ({
        idCombo: c.idCombo,
        cantidad: c.cantidad,
      }));
      await this.OrdenDetalleAccess.createDataMix(
        {
          productoList: productosPersistir,
          comboList: combosPersistir,
        },
        idOrden
      );
    } catch (error) {
      alert("error al crear detalles de la orden: " + error);
    }
  }

  //retorna datos para targetas o cuenta
  renderDatosPagoAdicionales(forma) {
    switch (forma) {
      case "banco":
        return html`
          <label>Nombre del banco:</label>
          <input type="text" name="bancoNombre" required />
          <label>Número de cuenta:</label>
          <input type="text" name="cuenta" required />
        `;
      case "tDeb":
        return html`
          <label>Número de tarjeta:</label>
          <input type="text" name="tarjetaNumero" required />
          <label>Fecha de vencimiento:</label>
          <input type="text" name="fechaVencimiento" required />
        `;
      case "tCred":
        return html`
          <label>Número de tarjeta:</label>
          <input type="text" name="tarjetaNumero" required />
          <label>Fecha de vencimiento:</label>
          <input type="text" name="fechaVencimiento" required />
        `;
      case "cash":
      default:
        return html``; // Nada para efectivo o vacío
    }
  }

  //actualiza forma de pago
  actualizarFormaPago(index, e) {
    const forma = e.target.value;
    this.pagosSeleccionados[index].forma = forma;

    if (forma !== "") {
      // Sólo setea la cantidad si no existe aún (para no sobreescribir edición del usuario)
      if (!this.pagosSeleccionados[index].cantidad) {
        this.pagosSeleccionados[index].cantidad =
          this.calcularTotal() - this.totalPagado();
      }
    } else {
      this.pagosSeleccionados[index].cantidad = null; // limpia cantidad si forma es vacía
    }

    this.render();
  }

  // regresamos a index enviando un evento
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

  // Agrega un nuevo campo de pago y setea el restante que debe paga
  agregarPago() {
    const restante = parseFloat(
      (this.calcularTotal() - this.totalPagado()).toFixed(2)
    );
    this.pagosSeleccionados = [
      ...this.pagosSeleccionados,
      {
        forma: "",
        cantidad: restante > 0 ? restante : 0,
      },
    ];
    this.render();
  }

  // Actualiza la cantidad de pago seleccionada
  actualizarCantidadPago(index, e) {
    const valor = e.target.value.replace(",", ".");
    const numero = parseFloat(valor);
    if (!isNaN(numero)) {
      this.pagosSeleccionados[index].cantidad = numero;
    }
    this.render();
  }

  // Elimina un campo de pago
  eliminarPago(index) {
    this.pagosSeleccionados.splice(index, 1);
    this.render();
  }

  // Validación del campo decimal
  validarInputDecimal(e) {
    const tecla = e.key;
    const valor = e.target.value;

    // Permitir teclas de control
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(tecla)
    ) {
      return;
    }

    // Permitir solo dígitos y un punto
    if (!/[\d.]/.test(tecla)) {
      e.preventDefault();
      return;
    }

    // Prevenir múltiples puntos
    if (tecla === "." && valor.includes(".")) {
      e.preventDefault();
      return;
    }

    // Verificar que no exceda 2 decimales
    const [entero, decimal] = valor.split(".");
    if (
      decimal &&
      decimal.length >= 2 &&
      e.target.selectionStart > valor.indexOf(".")
    ) {
      e.preventDefault();
    }
  }
  limpiar() {
    console.log("limpiando");

    this.pagosSeleccionados = [];
    carritoState.setCombos([]);
    carritoState.setProductos([]);
    this.sucursalSeleccionada = [];
    carritoState._notify();

    this.plantilla();
  }
}

customElements.define("zona-pagos", ZonaPago);
export const Zona = new ZonaPago();
