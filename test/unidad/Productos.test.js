import { assert } from 'chai';
import sinon from 'sinon';
import ProductoAccess from '../../src/control/productoAccess.js';

describe('ProductoTest', () => {
  let producto;
  let fetchStub;

  beforeEach(() => {
    producto = new ProductoAccess();
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    fetchStub.restore();
  });

  //pruebas

  it('debería instanciar ProductoAccess', () => {
    const instance = new ProductoAccess();
    assert.instanceOf(instance, ProductoAccess);
  });

  
  it('productos findRange debería obtener los productos', async () => {

    //indicamos que debe devolver la peticion
    fetchStub.resolves({
      json: () => Promise.resolve({
        productos: [
          { id: 1, nombre: 'Producto 1' },
          { id: 2, nombre: 'Producto 2' }
        ]
      }),
      status: 200
    });

    const response = await producto.getData();
    const data = await response.json();


    assert.isArray(data.productos, 'productos debe ser un arreglo');
    assert.lengthOf(data.productos, 2, 'productos debe tener 2 elementos');
    assert.strictEqual(data.productos[0].nombre, 'Producto 1', 'Nombre del primer producto');
    assert.strictEqual(response.status, 200, 'el estatus deberia ser 200');
    assert.strictEqual(data.productos[1].nombre, 'Producto 2', 'Nombre del segundo producto');

    const calledUrl = fetchStub.firstCall.args[0];
    assert.strictEqual(calledUrl, 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/producto', 'URL incorrecta');
  });

  it('productos findById debería obtener un producto en específico', async () => {
    fetchStub.resolves({
      json: () => Promise.resolve({
        producto: { id: 1, nombre: 'Producto 1' }
      }),
      status: 200
    });

    const response = await producto.getData(1);
    const data = await response.json();

    assert.isObject(data.producto, 'producto debe ser un objeto');
    assert.strictEqual(data.producto.nombre, 'Producto 1', 'Nombre del producto debe ser "Producto 1"');
    assert.strictEqual(response.status, 200, 'el estatus deberia ser 200');

    const calledUrl = fetchStub.firstCall.args[0];
    assert.strictEqual(calledUrl, 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/producto/1', 'URL incorrecta');
  });

  it('productos UpdateData debería actualizar un producto en específico y retornarlo', async () => {
    fetchStub.resolves({
      json: () => Promise.resolve({
        producto: { id: 1, nombre: 'Producto 1 actualizado' }
      }),
      status: 201
    });

    const response = await producto.updateData({nombre:"Producto 1 actualizado"},1);
    const data = await response.json();

    assert.isObject(data.producto, 'producto debe ser un objeto');
    assert.strictEqual(data.producto.nombre, 'Producto 1 actualizado', 'Nombre del producto debe ser "Producto 1"');
    assert.strictEqual(response.status, 201, 'el estatus deberia ser 200');

    const calledUrl = fetchStub.firstCall.args[0];
    assert.strictEqual(calledUrl, 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/producto/1', 'URL incorrecta');
  });

  it('productos createData debería crear un producto', async () => {
    fetchStub.resolves({
      status: 200
    });

    const response = await producto.updateData({nombre:"Producto 3 creado"});

    assert.strictEqual(response.status, 200, 'el estatus deberia ser 200');

    const calledUrl = fetchStub.firstCall.args[0];
    assert.strictEqual(calledUrl, 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/producto', 'URL incorrecta');
  });

  it('productos deleteData debería eliminar un producto', async () => {
    fetchStub.resolves({
      status: 201
    });

    const response = await producto.deleteData(3);

    assert.strictEqual(response.status, 201, 'el estatus deberia ser 201');

    const calledUrl = fetchStub.firstCall.args[0];
    assert.strictEqual(calledUrl, 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/producto/3', 'URL incorrecta');
  });



});
