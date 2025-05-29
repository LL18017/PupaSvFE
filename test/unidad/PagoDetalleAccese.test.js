import { assert } from 'chai';
import sinon from 'sinon';
import Pago from '../../src/entity/Pago.js';
import PagoDetalleAccess from "../../src/control/PagoDetalleAccess.js";
import PagoDetalle from '../../src/entity/PagoDetalle.js';

global.fetch = () => { };

describe('PagoDetalleAccessTest', () => {
    let pagoDetalleAccess;
    let fetchStub;

    beforeEach(() => {
        pagoDetalleAccess = new PagoDetalleAccess();
        fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(() => {
        fetchStub.restore();
    });

    it('debería crear un pagoDetalle',async () => {
        const access = new PagoDetalleAccess();
        const idOrden = 1;
        const pago = new Pago(1, { idOrden: idOrden}, new Date(), "cash", null);
        const pagoDetalle = new PagoDetalle(null, pago, 12.00, null);
        fetchStub.resolves({
            status: 200,
            json: async () => updatedComboData,
            headers: { get: (header) => header === "Content-Type" ? "application/json" : null }
        });

        const data = await access.createData(pagoDetalle, idOrden);
        
        
        assert.strictEqual(data.status, 200);
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/pagoDetalle/${idOrden}`);

    });
});

