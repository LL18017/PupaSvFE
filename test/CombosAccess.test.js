import { expect } from 'chai';
import sinon from 'sinon';
import ComboAccess from '../src/control/ComboAccess.js';


console.log('Intentando importar ComboAccess:', ComboAccess);
global.fetch = () => { };

describe('ComboAccessTest', () => {
    let combo;
    let fetchStub;

    beforeEach(() => {
        //console.log('Dentro de beforeEach: ComboAccess antes de new:', ComboAccess);
        combo = new ComboAccess(); // Crea una nueva instancia de ComboAccess para cada prueba
        //console.log('Dentro de beforeEach: combo después de new:', combo);
        fetchStub = sinon.stub(global, 'fetch'); // Stub de global.fetch para cada prueba
    });

    afterEach(() => {
        fetchStub.restore();
    });

    it('debería instanciar ComboAccess', () => {
        const instance = new ComboAccess();
        expect(instance).to.be.an.instanceOf(ComboAccess);
    });

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
        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo'); // Sin ID, first, max

        expect(data).to.be.an("array").that.has.lengthOf(2);
        expect(data[0].nombre).to.equal("superCombo");
    });

    it('getData con id debería obtener un combo específico', async () => {
        const mockCombo = { id: 1, nombre: 'Combo 1' }; // Capitalización corregida
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

    it('createData debería crear un combo', async () => {
        const newComboData = { nombre: 'Combo nuevo' };
        // Asumiendo que tu API devuelve el objeto creado con un ID
        fetchStub.resolves({
            status: 200, // O 201 para creado
            json: async () => ({ id: 999, ...newComboData }),
            headers: { get: (header) => header === "Content-Type" ? "application/json" : null }
        });


        const resultResponse = await combo.createData(newComboData); // Corregido: llamando a createData
        const data = await resultResponse.json(); // Asumiendo que createData devuelve el nuevo objeto

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

    it('deleteData debería eliminar un combo', async () => {
        fetchStub.resolves({
            status: 204,
            json: async () => null // si se intenta llamar .json()
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


        // resultResponse YA contendrá el array JSON directamente
        const data = await combo.getDataPorNombre('superCombo'); // <--- ¡CAMBIO AQUÍ! Await directamente el resultado

        expect(fetchStub.calledOnce).to.be.true;
        const calledUrl = fetchStub.firstCall.args[0];
        expect(calledUrl).to.equal('http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/combo/nombre/superCombo');

        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(1);
        expect(data[0].nombre).to.equal('Combo superCombo');
    });
});

