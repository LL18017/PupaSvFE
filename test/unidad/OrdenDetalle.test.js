import { assert } from 'chai';
import sinon from 'sinon';
import Orden from '../../src/entity/Orden.js';
import OrdenDetalleAccess from "../../src/control/OrdenDetalleAccess.js";

global.fetch = () => { };

describe('OrdenDetalleAccessTest', () => {
    let ordenDetalleAccess;
    let fetchStub;

    beforeEach(() => {
        ordenDetalleAccess = new OrdenDetalleAccess();
        fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(() => {
        fetchStub.restore();
    });

    it('debería crear un ordenDetalle',async () => {
        const access = new OrdenDetalleAccess();
        const idOrden = 1;
        const orden = new Orden(null, new Date(), "sa", false);
        
        fetchStub.resolves({
            status: 200, // O 201 para creado
            headers: { get: (header) => header === "Content-Type" ? "application/json" : null }
        });

        const data = await access.createData( {
            productoList: [ { id: 1001, cantidad: 2 },
                { id: 1002, nombre: 3 },],
           },idOrden);
        
        
        assert.strictEqual(data.status, 200);
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/ordenDetalle/${idOrden}`);

    });
});

