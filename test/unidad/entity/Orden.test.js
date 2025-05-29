import assert from 'assert';
import Orden from '../../../src/entity/Orden.js';

describe('OrdenEntity', () => {
    it('debería crear una instancia correctamente', () => {
        const fecha = new Date();
        const orden = new Orden(1, fecha, 'Sucursal A', false);

        assert.ok(orden instanceof Orden);
        assert.strictEqual(orden.idOrden, 1);
        assert.strictEqual(orden.fecha, fecha);
        assert.strictEqual(orden.sucursal, 'Sucursal A');
        assert.strictEqual(orden.anulada, false);
    });

    it('debería permitir valores anulados verdaderos', () => {
        const orden = new Orden(2, new Date(), 'Sucursal B', true);
        assert.strictEqual(orden.anulada, true);
    });

    it('debería permitir fecha como instancia de Date', () => {
        const fecha = new Date();
        const orden = new Orden(3, fecha, 'Sucursal C', false);
        assert.ok(orden.fecha instanceof Date);
    });
});
