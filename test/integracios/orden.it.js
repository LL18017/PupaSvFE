import assert from "assert";
import fetch from "node-fetch"; 

describe("Carga de orden", function () {
  it("Debería obtener una lista no vacía", async function () {
    const res = await fetch("http://localhost:3050/endPoints/orden.json");
    assert.ok(res.ok, "No se pudo acceder al recurso");

    const orden = await res.json();
    assert.ok(Array.isArray(orden), "La respuesta no es un array");
    assert.ok(orden.length > 0, "La lista está vacía");
  });
});
