class PagoDetalle {
  constructor(idPagoDetalle, idPago, monto, observaciones) {
    this.idPagoDetalle = idPagoDetalle;
    this.idPago = idPago;
    this.monto = monto;
    this.observaciones = observaciones;
  }
}

export default PagoDetalle;
