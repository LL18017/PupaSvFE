import assert from "assert";
import fetch from "node-fetch"; 

describe("Carga de combos", function () {
  it("Debería obtener una lista no vacía", async function () {
    const res = await fetch("http://localhost:3050/endPoints/combo.json");
    assert.ok(res.ok, "No se pudo acceder al recurso");

    const combos = await res.json();
    assert.ok(Array.isArray(combos), "La respuesta no es un array");
    assert.ok(combos.length > 0, "La lista está vacía");
  });
});
