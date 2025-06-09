import { expect } from 'chai';
import sinon from 'sinon';
import ComboAccess from '../src/control/ComboAccess.js';


console.log('Intentando importar ComboAccess:', ComboAccess);
global.fetch = () => { };

describe('ComboAccessTest', () => {
    let combo;
    let fetchStub;

    beforeEach(() => {
        combo = new ComboAccess(); 
        fetchStub = sinon.stub(global, 'fetch'); 
    });

    afterEach(() => {
        fetchStub.restore();
    });

    // -- Prueba para intanciar los combos --
    it('debería instanciar ComboAccess', () => {
        const instance = new ComboAccess();
        expect(instance).to.be.an.instanceOf(ComboAccess);
    });

    // --- Prueba para obtener los combos --
    it('getData debería obtener todos los combos (o paginados)', async () => {
        const mockCombos = [
            { id: 1001, nombre: 'superCombo' },
            { id: 1002, nombre: 'megaCombo' },
        ];

        fetchStub.resolves({
            status: 200,
            json: async () => mockCombos
        });
        const resultResponse = await combo.getData();
        const data = await resultResponse.json();

        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo'); 

        expect(data).to.be.an("array").that.has.lengthOf(2);
        expect(data[0].nombre).to.equal("superCombo");
    });

    //--- Prueba para un combos por su nombre ---
    it('getData con id debería obtener un combo específico', async () => {
        const mockCombo = { id: 1, nombre: 'Combo 1' };
        fetchStub.resolves({
            status: 200,
            json: async () => mockCombo
        });


        const resultResponse = await combo.getData(1);
        const data = await resultResponse.json();

        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo/1');

        expect(data).to.be.an('object');
        expect(data.nombre).to.equal('Combo 1');
        expect(data.id).to.equal(1);
    });

    //--- Prueba para actualizar un combo --- 
    it('updateData debería actualizar un combo', async () => {
        const updatedComboData = { id: 1, nombre: 'Combo 1 actualizado' };
        fetchStub.resolves({
            status: 200,
            json: async () => updatedComboData,
            headers: { get: (header) => header === "Content-Type" ? "application/json" : null }
        });

        const resultResponse = await combo.updateData({ nombre: 'Combo 1 actualizado' }, 1);
        const data = await resultResponse.json();


        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        const calledRequestOptions = fetchStub.firstCall.args[1];
        const calledBody = JSON.parse(calledRequestOptions.body);

        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo/1');
        expect(calledRequestOptions.method).to.equal('PUT');
        expect(calledBody).to.deep.equal({ nombre: 'Combo 1 actualizado' });

        expect(data).to.be.an('object');
        expect(data.nombre).to.equal('Combo 1 actualizado');
        expect(data.id).to.equal(1);
    });

    //--- Prueba para crear un nuevo combo
    it('createData debería crear un combo', async () => {
        const newComboData = { nombre: 'Combo nuevo' };
        fetchStub.resolves({
            status: 200,
            json: async () => ({ id: 999, ...newComboData }),
            headers: { get: (header) => header === "Content-Type" ? "application/json" : null }
        });

        const resultResponse = await combo.createData(newComboData);
        const data = await resultResponse.json(); 

        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        const calledRequestOptions = fetchStub.firstCall.args[1];
        const calledBody = JSON.parse(calledRequestOptions.body);

        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo');
        expect(calledRequestOptions.method).to.equal('POST');
        expect(calledBody).to.deep.equal(newComboData);

        expect(data).to.be.an('object');
        expect(data.id).to.equal(999);
        expect(data.nombre).to.equal('Combo nuevo');
    });

    // --- Prueba para eliminar un combo 
    it('deleteData debería eliminar un combo', async () => {
        fetchStub.resolves({
            status: 204,
            json: async () => null
        });


        const resultResponse = await combo.deleteData(3);

        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        const calledRequestOptions = fetchStub.firstCall.args[1];

        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo/3');
        expect(calledRequestOptions.method).to.equal('DELETE');
        expect(resultResponse.status).to.equal(204);
    });

    it('getDataPorNombre debería obtener combos por nombre', async () => {
        const mockCombosByName = [
            { id: 1001, nombre: 'Combo superCombo' }
        ];
        fetchStub.resolves({
            ok: true,
            status: 200,
            json: async () => mockCombosByName
        });

        const data = await combo.getDataPorNombre('superCombo'); 
        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo/nombre/superCombo');

        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(1);
        expect(data[0].nombre).to.equal('Combo superCombo');
    });
});

