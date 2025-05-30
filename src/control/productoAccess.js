import dataAccess from "./dataAccess.js";

class ProductoAccess extends dataAccess {
  constructor() {
    super("producto"); // Pasa el valor específico para la subclase
  }

  getDataPorNombre(nombre, first = 0, max =5) {
    const url = `${this.URL}/nombre/${nombre}`;
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al obtener productos con nombre "${nombre}"`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error en ProductoAccess.getDataPorNombre:", error);
        throw error; // Re-lanza el error para que lo capture el componente
      });
  }
   
  getAllProducts(first = 0, max = 0) {
    const url = this.URL; 
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al obtener todos los productos`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error en ProductoAccess.getAllProducts:", error);
        throw error; // Re-lanza el error para que lo capture el componente
      });
  }
}

export default ProductoAccess;
