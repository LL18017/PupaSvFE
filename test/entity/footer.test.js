import assert from "assert";
import sinon from "sinon";
import "../../src/boundary/piePag/footer.js";

describe("footer component", function () {
    let footerElement;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        localStorage.clear();
        footerElement = document.createElement("footer-component");
        document.body.appendChild(footerElement);
    });

    afterEach(() => {
        sandbox.restore();
        footerElement.remove();
    });
    it("Muestra mensaje de direccion", function () {
        const mensaje = `Calle 5ª Avenida Sur, #123, Colonia El Palmar, Santa Ana, El Salvador.`
        footerElement.render();
        const shadow = footerElement.shadowRoot;
        assert(shadow.innerHTML.includes(mensaje));
    });
    it("Renderiza los íconos de redes sociales", function () {
        footerElement.render();
        const shadow = footerElement.shadowRoot;
      
        const facebook = shadow.querySelector('img[alt="Facebook"]');
        const instagram = shadow.querySelector('img[alt="Instagram"]');
        const whatsapp = shadow.querySelector('img[alt="WhatsApp"]');
        const telefono = shadow.querySelector('img[alt="Teléfono"]');
      
        assert(facebook, "Debe haber un ícono de Facebook");
        assert(instagram, "Debe haber un ícono de Instagram");
        assert(whatsapp, "Debe haber un ícono de WhatsApp");
        assert(telefono, "Debe haber un ícono de Teléfono");
      });
      


})