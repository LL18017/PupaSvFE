// carritoState.js
class CarritoState {
  constructor() {
    this.productos = [];
    this.combos = [];
    this.listeners = [];
  }

  agregarProducto(producto) {
    this.productos.push(producto);
    this._notify();
  }

  eliminarProducto(nombre) {
    this.productos = this.productos.filter((p) => p.nombre !== nombre);
    this._notify();
  }

  getCantidadTotal() {
    return this.productos.length + this.combos.length;
  }

  onChange(listener) {
    this.listeners.push(listener);
  }

  _notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const carritoState = new CarritoState();
