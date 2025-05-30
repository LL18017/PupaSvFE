import dataAccess from "./dataAccess.js";

class ComboAccess extends dataAccess {
  constructor() {
    super("combo"); // Pasa el valor específico para la subclase
  }

  getDataPorNombre(nombre,first,max) {
    let request = `${this.URL}/nombre/${nombre}`;
  const queryParams = new URLSearchParams();

  if (first !== undefined && max !== undefined) {
    queryParams.append("first", first);
    queryParams.append("max", max);
  }

  if (queryParams.toString()) {
    request += `?${queryParams.toString()}`;
  }

  return fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error al obtener combos con nombre "${nombre}"`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error en ComboAccess.getDataPorNombre:", error);
      throw error;
    });
  }
 /*
  getAllCombos() {
    const url = this.URL; 
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error al obtener todos los combos`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error en ComboAccess.getAllCombos:", error);
        throw error;
      });
  }*/
}

export default ComboAccess;
