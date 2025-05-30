import { assert } from 'chai';
import sinon from 'sinon';
import PagoEntity from '../../src/entity/Pago.js';
import PagoAccess from "../../src/control/PagoAccess.js";
import Pago from '../../src/entity/Pago.js';
import Orden from '../../src/entity/Orden.js';

global.fetch = () => { };

describe('PagoAccessTest', () => {
    let pagoAccess;
    let fetchStub;

    beforeEach(() => {
        pagoAccess = new PagoAccess();
        fetchStub = sinon.stub(global, 'fetch');
    });

    afterEach(() => {
        fetchStub.restore();
    });

    it('debería crear una pago', async () => {
        const access = new PagoAccess();
        const idOrden = new Orden(1, new Date(), "sa", false)
        const pago = new PagoEntity(null, idOrden, new Date(), "cash", undefined);

        fetchStub.resolves({
            status: 200, // O 201 para creado
            headers: {
                get: () => 'v1/pago/789',
            }
        });

        const data = await access.createData(pago);
        const location = data.headers.get('Location');
        const idPago = location.split('/').pop();

        assert.strictEqual(data.status, 200);
        assert.strictEqual(idPago, '789');
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/pago`);

    });

    it('debería obtener una lista de pagoes', async () => {
        const access = new PagoAccess();
        const idOrden = new Orden(1, new Date(), "sa", false)
        const pagoes = [
            new PagoEntity(1, idOrden, new Date(), "cash", undefined),
            new PagoEntity(2, idOrden, new Date(), "tcred", undefined),
            new PagoEntity(3, idOrden, new Date(), "tdeb", undefined),
        ];

        fetchStub.resolves({
            status: 200,
            json: async () => pagoes
        });

        const response = await access.getData();
        const data = await response.json();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(data.length, 3)
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/pago`);

    });
    it('debería eliminar una pago', async () => {
        const access = new PagoAccess();
        const idOrden = new Orden(1, new Date(), "sa", false)
        const pagoes = [
            new PagoEntity(1, idOrden, new Date(), "cash", undefined),
            new PagoEntity(2, idOrden, new Date(), "tcred", undefined),
            new PagoEntity(3, idOrden, new Date(), "tdeb", undefined),
        ];
        const idPagoEliminado = 1;
        fetchStub.resolves({
            status: 200,
            json: async () => pagoes.filter(o => o.idPago !== idPagoEliminado)
        });

        const response = await access.deleteData(idPagoEliminado);
        const data = await response.json();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(data.length, 2)
        assert.strictEqual(data.filter(o => o.idPago === idPagoEliminado).length, 0)
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/pago/${idPagoEliminado}`);

    });
    it('debería actualizar una pago', async () => {
        const access = new PagoAccess();
        const idPagoActualizado = 1;
        const idOrden = new Orden(1, new Date(), "sa", false);

        const pagoNueva = new Pago(idPagoActualizado, idOrden, new Date, "test", true)
        fetchStub.resolves({
            status: 200,
        });

        const response = await access.updateData(pagoNueva, idPagoActualizado);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/pago/${idPagoActualizado}`);
    });



});

