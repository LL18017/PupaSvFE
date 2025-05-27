class Pago {
  constructor(idPago, idOrden, fecha, metodo, referencia) {
    this.idPago = idPago;
    this.idOrden = idOrden;
    this.fecha = fecha;
    this.metodoPago = metodo;
    this.referencia = referencia;
  }
}

export default Pago;
