import assert from 'assert';
import Pago from '../../src/entity/Pago.js';

describe('PagoEntity', () => {
    it('debería crear una instancia correctamente', () => {
        const fecha = new Date();
        const pago = new Pago(1, 101, fecha, 'Efectivo', undefined);

        assert.ok(pago instanceof Pago);
        assert.strictEqual(pago.idPago, 1);
        assert.strictEqual(pago.idOrden, 101);
        assert.strictEqual(pago.fecha, fecha);
        assert.strictEqual(pago.metodoPago, 'Efectivo');
        assert.strictEqual(pago.referencia, undefined);
    });

    it('debería aceptar referencias vacías o nulas', () => {
        const pago = new Pago(2, 102, new Date(), 'Tarjeta', null);
        assert.strictEqual(pago.referencia, null);
    });

    it('debería aceptar diferentes métodos de pago', () => {
        const pago = new Pago(3, 103, new Date(), 'Transferencia', undefined);
        assert.strictEqual(pago.metodoPago, 'Transferencia');
    });

    it('debería tener fecha como instancia de Date', () => {
        const fecha = new Date();
        const pago = new Pago(4, 104, fecha, 'Paypal', undefined);
        assert.ok(pago.fecha instanceof Date);
    });
});
