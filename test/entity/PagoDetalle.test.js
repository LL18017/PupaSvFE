import assert from 'assert';
import PagoDetalle from '../../src/entity/PagoDetalle.js';

describe('PagoDetalleEntity', () => {
    it('debería crear una instancia correctamente', () => {
        const pagoDetalle = new PagoDetalle(1, 10, 25.5, 'Pago parcial');

        assert.ok(pagoDetalle instanceof PagoDetalle);
        assert.strictEqual(pagoDetalle.idPagoDetalle, 1);
        assert.strictEqual(pagoDetalle.idPago, 10);
        assert.strictEqual(pagoDetalle.monto, 25.5);
        assert.strictEqual(pagoDetalle.observaciones, 'Pago parcial');
    });

    it('debería aceptar monto igual a 0', () => {
        const pagoDetalle = new PagoDetalle(2, 11, 0, 'Monto inicial');
        assert.strictEqual(pagoDetalle.monto, 0);
    });

    it('debería aceptar observaciones vacías', () => {
        const pagoDetalle = new PagoDetalle(3, 12, 100, '');
        assert.strictEqual(pagoDetalle.observaciones, '');
    });

    it('debería aceptar observaciones nulas', () => {
        const pagoDetalle = new PagoDetalle(4, 13, 150, null);
        assert.strictEqual(pagoDetalle.observaciones, null);
    });

});
