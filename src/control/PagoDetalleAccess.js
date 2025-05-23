import dataAccess from "./dataAccess.js";

class PagoDetalleAccess extends dataAccess {
  constructor() {
    super("pagoDetalle");
  }

  createDataMix(datosMixtos, idOrden) {
    console.log();
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

export default PagoDetalleAccess;
