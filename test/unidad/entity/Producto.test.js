import assert from 'assert';
import producto from '../../../src/entity/Producto.js'; // Asegúrate de usar la ruta correcta

describe('Clase producto', () => {
    it('debería crear una instancia correctamente', () => {
        const p = new producto(1, 'Galletas', true, 'Paquete de 12 unidades', 'https://ejemplo.com/galletas.jpg');

        assert.ok(p instanceof producto);
        assert.strictEqual(p.idProducto, 1);
        assert.strictEqual(p.nombre, 'Galletas');
        assert.strictEqual(p.activo, true);
        assert.strictEqual(p.observaciones, 'Paquete de 12 unidades');
        assert.strictEqual(p.url, 'https://ejemplo.com/galletas.jpg');
    });

    it('debería aceptar campos nulos o vacíos', () => {
        const p = new producto(2, '', false, null, '');

        assert.strictEqual(p.nombre, '');
        assert.strictEqual(p.activo, false);
        assert.strictEqual(p.observaciones, null);
        assert.strictEqual(p.url, '');
    });

    it('debería aceptar valores booleanos en "activo"', () => {
        const pActivo = new producto(3, 'Chocolates', true, '', '');
        const pInactivo = new producto(4, 'Dulces', false, '', '');

        assert.strictEqual(pActivo.activo, true);
        assert.strictEqual(pInactivo.activo, false);
    });
});
