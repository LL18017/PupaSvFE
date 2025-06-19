import assert from "assert";
import fetch from "node-fetch"; 

describe("Carga de productos", function () {
  it("Debería obtener una lista no vacía", async function () {
    const res = await fetch("http://localhost:3050/endPoints/producto.json");
    assert.ok(res.ok, "No se pudo acceder al recurso");

    const productos = await res.json();
    assert.ok(Array.isArray(productos), "La respuesta no es un array");
    assert.ok(productos.length > 0, "La lista está vacía");
  });
});
