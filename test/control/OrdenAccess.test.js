import { assert } from 'chai';
import sinon from 'sinon';
import OrdenEntity from '../../src/entity/Orden.js';
import OrdenAccess from "../../src/control/OrdenAccess.js";
import Orden from '../../src/entity/Orden.js';

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
        const idOrden = location.split('/').pop();

        assert.strictEqual(data.status, 200);
        assert.strictEqual(idOrden, '789');
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/orden`);

    });

    it('debería obtener una lista de ordenes', async () => {
        const access = new OrdenAccess();
        const ordenes = [new OrdenEntity(1, new Date(), "sa", false), new OrdenEntity(2, new Date(), "sa", false), new OrdenEntity(2, new Date(), "sa", false)];

        fetchStub.resolves({
            status: 200,
            json: async () => ordenes
        });

        const response = await access.getData();
        const data = await response.json();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(data.length, 3)
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/orden`);

    });
    it('debería eliminar una orden', async () => {
        const access = new OrdenAccess();
        const ordenes = [new OrdenEntity(1, new Date(), "sa", false), new OrdenEntity(2, new Date(), "sa", false), new OrdenEntity(2, new Date(), "sa", false)];
        const idOrdenEliminado = 1;
        fetchStub.resolves({
            status: 200,
            json: async () => ordenes.filter(o => o.idOrden !== idOrdenEliminado)
        });

        const response = await access.deleteData(idOrdenEliminado);
        const data = await response.json();

        assert.strictEqual(response.status, 200);
        assert.strictEqual(data.length, 2)
        assert.strictEqual(data.filter(o => o.idOrden === idOrdenEliminado).length, 0)
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/orden/${idOrdenEliminado}`);

    });
    it('debería actualizar una orden', async () => {
        const access = new OrdenAccess();
        const idOrdenActualizado = 1;
        const ordenNueva = new Orden(idOrdenActualizado, new Date, "test", true)
        fetchStub.resolves({
            status: 200,
        });

        const response = await access.updateData(ordenNueva, idOrdenActualizado);

        assert.strictEqual(response.status, 200);
        assert.strictEqual(fetchStub.firstCall.args[0], `http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/orden/${idOrdenActualizado}`);


    });



});

