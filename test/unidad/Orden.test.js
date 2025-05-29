import { assert } from 'chai';
import sinon from 'sinon';
import OrdenEntity from '../../src/entity/Orden.js';
import OrdenAccess from "../../src/control/OrdenAccess.js";

global.fetch = () => { };

describe('OrdenAccessTest', () => {
    let ordenAccess;
    let fetchStub;

    beforeEach(() => {
        ordenAccess = new OrdenAccess();
        fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(() => {
        fetchStub.restore();
    });

    it('debería crear una orden', async () => {
        const access = new OrdenAccess();
        const orden = new OrdenEntity(null, new Date(), "sa", false);

        fetchStub.resolves({

            status: 200, // O 201 para creado
            headers: {
                get: () => 'v1/orden/789',
            }
        });

        const data = await access.createData(orden);
        const location = data.headers.get('Location');
        console.log(location);
        const idOrden = location.split('/').pop();

        assert.strictEqual(data.status, 200);
        assert.strictEqual(idOrden, '789');
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/orden`);

    });
});

