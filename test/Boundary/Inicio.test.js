import assert from "assert";
import sinon from "sinon";
import "../../src/boundary/inicio/inicio.js";

describe("Inicio component", function () {
    let InicioElement;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        localStorage.clear();
        InicioElement = document.createElement("main-inicio");
        document.body.appendChild(InicioElement);
    });

    afterEach(() => {
        sandbox.restore();
        InicioElement.remove();
    });
     it("Muestra mensaje inicial", function () {
        const mensaje=`Bienvenido a PupaSv, donde ofrecemos una buena comida, única experiencia
              con el sabor único de El Salvador. Si usted está aquí para un almuerzo o cena
              de negocios, celebrando una especial ocasión, o buscando un ambiente romántico
              para una cita, nuestro menú ofrece algo para todos.`
            InicioElement.render();
            const shadow = InicioElement.shadowRoot;
            assert(shadow.innerHTML.includes(mensaje));
        });


})
