// carritoState.js
class CarritoState {
  constructor() {
    this.productos = [];
    this.combos = [];
    this.listeners = [];
    this.CantidadTotal = 0;
  }

  //invoca todas las funciones
  _notify() {
    this.listeners.forEach((cb) => cb());
  }

  //guarda funciones
  subscribe(callback) {
    this.listeners.push(callback);
  }

  unsubscribe(callback) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  agregarProducto(producto) {
    const existente = this.productos.find(
      (c) => c.idProducto === producto.idProducto
    );

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
      this.CantidadTotal++;
    } else {
      this.productos.push({ ...producto, cantidad: 1 });
      this.CantidadTotal++;
    }
    this._notify();
  }

  eliminarProducto(producto) {
    const index = this.productos.findIndex(
      (p) => p.idProducto === producto.idProducto
    );

    if (index !== -1) {
      const existente = this.productos[index];

      if (existente.cantidad > 1) {
        existente.cantidad -= 1;
        this.CantidadTotal--;
      } else {
        // Eliminar el producto si la cantidad es 1 o menor
        this.productos.splice(index, 1);
        this.CantidadTotal--;
      }
    }
    this._notify();
  }
  agregarCombos(combo) {
    const existente = this.combos.find((c) => c.idCombo === combo.idCombo);

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
      this.CantidadTotal++;
    } else {
      this.combos.push({ ...combo, cantidad: 1 });
      this.CantidadTotal++;
    }
    this._notify();
  }

  eliminarCombos(combo) {
    const index = this.combos.findIndex((c) => c.idCombo === combo.idCombo);
    if (index !== -1) {
      const existente = this.combos[index];

      if (existente.cantidad > 1) {
        existente.cantidad -= 1;
        this.CantidadTotal--;
      } else {
        this.combos.splice(index, 1);
        this.CantidadTotal--;
      }
    }
    this._notify();
  }

  getCantidadTotal() {
    return this.CantidadTotal;
  }
  getCombos() {
    return this.combos;
  }
  getProductos() {
    return this.productos;
  }
}

export const carritoState = new CarritoState();
