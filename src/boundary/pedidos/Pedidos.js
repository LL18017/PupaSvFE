import { html, render } from "../../js/terceros/lit-html.js";
import { carritoState } from "../cart/carritoState.js";
class Pedidos extends HTMLElement {
  constructor() {
    super();
    this._onCarritoChange = this.render.bind(this);
    this._root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    carritoState.unsubscribe(this._onCarritoChange); // Limpiamos listener para evitar fugas de memoria
  }
  render() {
    const link = html`<link rel="stylesheet" href="./boundary/pedidos/pedidos.css" />`;
    const ordenesGuardadas = JSON.parse(localStorage.getItem("ordenes_pupa_tpi")) || [];
    let ordenesPendientes = JSON.parse(localStorage.getItem('ordenesPendientes')) || [];
    if (ordenesGuardadas.length === 0 && ordenesPendientes.length===0) {
      render(html`${link}<h3>No hay información aún</h3>`, this._root);
      return;
    }

    const plantilla = html`
          ${link}
          <h1 style>ordenes realizadas</h1>
          <div class="ordenes">
            ${ordenesGuardadas.map(o => html`
              <div class="orden">
                <div class="cabecera-orden">
                  <p><strong>Número de orden:</strong> ${o.idOrden}</p>
                </div>
                ${this.renderDetalle(o.productos, o.combos)}
                <div class="contenedorTotalButton">
                  <p><strong>Total:</strong> $${o.total}</p>
                  <button @click=${() => this.btnPedir(o)}>volver a pedir</button>
                </div>
              </div>
              `)}
            </div>
            <h1 style=display:${ordenesPendientes.length == 0 ? 'none' : 'block'}>ordenes Pendientes</h1>
            <div class="ordenes" style=display:${ordenesPendientes.length == 0 ? 'none' : 'grid'}>
            ${ordenesPendientes.map(o => html`
              <div class="orden">
                <div class="cabecera-orden">
                  <p><strong>Número de orden:</strong> ${o.idTemporal}</p>
                </div>
                ${this.renderDetalle(o.productos, o.combos)}
                <div class="contenedorTotalButton">
                    <p><strong>Total:</strong> $${o.total}</p>
                    <button @click=${() => this.btnCancelarOrdenPendiente(o.idTemporal)}>cancelar</button>
                </div>
              </div>
            `)}
          </div>
        `;

    render(plantilla, this._root);
  }

  renderDetalle(productos = [], combos = []) {
    const tieneProductos = productos.length > 0;
    const tieneCombos = combos.length > 0;

    if (!tieneProductos && !tieneCombos) {
      return html`<p><em>Esta orden no tiene productos ni combos.</em></p>`;
    }

    return html`
          ${tieneProductos ? html`
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productos.map(p => html`
                    <tr>
                      <td>${p.nombre}</td>
                      <td>${p.cantidad}</td>
                      <td>$${(p.precio * p.cantidad).toFixed(2)}</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          ` : null}
    
          ${tieneCombos ? html`
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Combo</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${combos.map(c => html`
                    <tr>
                      <td>${c.nombre}</td>
                      <td>${c.cantidad}</td>
                      <td>$${(c.precio * c.cantidad).toFixed(2)}</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          ` : null}
        `;
  }

  btnPedir(info) {
    carritoState.setProductos(info.productos);
    carritoState.setCombos(info.combos);
    const total = info.combos
      .concat(info.productos)
      .reduce((t, v) => t + v.cantidad, 0);

    carritoState.setCantidadTotal(total);
    carritoState._notify()
  }
  btnCancelarOrdenPendiente(idTemporal) {
    const ordenesPendientes = JSON.parse(localStorage.getItem('ordenesPendientes')) || [];
    const nuevasOrdenes = ordenesPendientes.filter(o => o.idTemporal !== idTemporal);
    localStorage.setItem('ordenesPendientes', JSON.stringify(nuevasOrdenes));
    this.render()
  }




}

customElements.define("pedidos-cliente", Pedidos);
