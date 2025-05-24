import dataAccess from "./dataAccess.js";

class OrdenDetalleAccess extends dataAccess {
  constructor() {
    super("ordenDetalle");
  }

  /**
   * @param {Array<Object>} datosMixtos - lista de objetos con idProductos, cantidadProductos, idCombos, cantidadCombo
   * @param {number} idOrden - ID de la orden a enviar como query param
   */
  createDataMix(datosMixtos, idOrden) {
    if (!idOrden || typeof datosMixtos !== "object" || datosMixtos === null) {
      throw new Error("Faltan datos requeridos");
    }

    return fetch(`${this.URL}/mixto?idOrden=${idOrden}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosMixtos),
    });
  }
}

export default OrdenDetalleAccess;
