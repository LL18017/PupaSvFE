import { assert } from "chai";
import { Zona as zonaPagoInstancia } from "../../src/boundary/ZonaPago/ZonaPago.js";
import { carritoState } from "../../src/boundary/cart/carritoState.js";

describe("ZonaPagoTest", () => {
  beforeEach(() => {
    carritoState.setProductos([{ idProducto: 1, precio: 10, cantidad: 2 }]);
    carritoState.setCombos([{ idCombo: 1, precio: 5, cantidad: 2 }]);
    zonaPagoInstancia.pagosSeleccionados = [
      { forma: "efectivo", cantidad: 10.0 },
      { forma: "tarjeta", cantidad: 5.0 },
      { forma: "transferencia", cantidad: 9.0 },
    ];
    zonaPagoInstancia.sucursalSeleccionada = "sa";
  });

  it("calcularTotal devuelve '20.00'", () => {
    assert.equal(
      zonaPagoInstancia.calcularTotal(),
      30.0,
      "calcularTotal debe retornar string '30.00'"
    );
  });

  it("totalPagado devuelve '24.00'", () => {
    assert.equal(
      zonaPagoInstancia.totalPagado(),
      24,
      "totalPagado debe retornar string '24.00'"
    );
  });

  it("puede pagar devuelve false", () => {
    assert.equal(
      zonaPagoInstancia.puedePagar(),
      false,
      "totalPagado debe retornar false "
    );
  });
  it("puede pagar devuelve true", () => {
    zonaPagoInstancia.pagosSeleccionados.push({
      forma: "transferencia",
      cantidad: 6.0,
    });
    console.log(zonaPagoInstancia.pagosSeleccionados);

    assert.equal(
      zonaPagoInstancia.puedePagar(),
      true,
      "totalPagado debe retornar false "
    );
  });

  // Verifica si se puede habilitar el botón de pagar
  // puedePagar() {
  //   const total = parseFloat(this.calcularTotal());
  //   return (
  //     this.sucursalSeleccionada !== "" &&
  //     this.pagosSeleccionados.length > 0 &&
  //     Math.abs(this.totalPagado() - total) < 0.01
  //   );
  // }
});
