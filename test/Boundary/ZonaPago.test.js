import { assert } from "chai";
import sinon from 'sinon';
import { Zona as zonaPagoInstancia } from "../../src/boundary/ZonaPago/ZonaPago.js";
import { carritoState } from "../../src/boundary/cart/carritoState.js";
import { render } from "../../src/js/terceros/lit-html.js";
import OrdenAccess from '../../src/control/OrdenAccess.js';
import OrdenDetalleAccess from '../../src/control/OrdenDetalleAccess.js';
import PagoAccess from '../../src/control/PagoAccess.js';
import PagoDetalleAccess from '../../src/control/PagoDetalleAccess.js';
import Orden from "../../src/entity/Orden.js";

describe("ZonaPagoTest", () => {
  let ordenAccess, ordenDetalleAccess, pagoAccess, pagoDetalleAccess;
  let fetchStub;
  let volverStub;
  let pagarStub;
  beforeEach(() => {
    carritoState.setProductos([{ idProducto: 1, precio: 10, cantidad: 2 }]);
    carritoState.setCombos([{ idCombo: 1, precio: 5, cantidad: 2 }]);
    zonaPagoInstancia.pagosSeleccionados = [
      { forma: "efectivo", cantidad: 10.0 },
      { forma: "tarjeta", cantidad: 5.0 },
      { forma: "transferencia", cantidad: 9.0 },
    ];
    zonaPagoInstancia.sucursalSeleccionada = "sa";
    zonaPagoInstancia.formaPago = [
      { id_forma: "cash", nombre: "Efectivo" },
      { id_forma: "banco", nombre: "Transferencia Bancaria" },
      { id_forma: "tDeb", nombre: "Targeta Debito" },
      { id_forma: "tCred", nombre: "Targeta Credito" },
    ];
    

    //accesos y entities
    ordenAccess = new OrdenAccess();
    ordenDetalleAccess = new OrdenDetalleAccess();
    pagoAccess = new PagoAccess();
    pagoDetalleAccess = new PagoDetalleAccess();

    fetchStub = sinon.stub(global, 'fetch');

  });

  afterEach(() => {
    fetchStub.restore();
  });

  //metodos de logica
  it("calcularTotal devuelve '20.00'", () => {
    assert.equal(
      zonaPagoInstancia.calcularTotal(),
      30.0,
      "calcularTotal debe retornar string '30.00'"
    );
  });

  it("totalPagado devuelve '24.00'", () => {
    assert.equal(
      zonaPagoInstancia.totalPagado(),
      24,
      "totalPagado debe retornar string '24.00'"
    );
  });

  it("puedePagar devuelve false", () => {
    assert.equal(
      zonaPagoInstancia.puedePagar(),
      false,
      "totalPagado debe retornar false "
    );
  });

  it("puedePagar devuelve true", () => {
    zonaPagoInstancia.pagosSeleccionados.push({
      forma: "transferencia",
      cantidad: 6.0,
    });
    assert.equal(
      zonaPagoInstancia.puedePagar(),
      true,
      "totalPagado debe retornar false "
    );
  });

  function renderToString(templateResult) {
    const container = document.createElement("div");
    render(templateResult, container);

    let htmlString = container.innerHTML;

    // Eliminar todos los comentarios Lit tipo <!--?lit$...$-->
    htmlString = htmlString.replace(/<!--\?lit\$[0-9]+\$-->/g, '');

    // Eliminar todos los comentarios vacíos <!---->
    htmlString = htmlString.replace(/<!---->/g, '');

    // Eliminar espacios y saltos de línea entre etiquetas para compactar
    htmlString = htmlString.replace(/\s+/g, ' ').trim();

    // Quitar espacios entre etiquetas > <
    htmlString = htmlString.replace(/>\s+</g, '><');

    return htmlString;
  }


  it("renderSpiner devuelve la plantilla correcta", () => {
    const expectedHTML = '<div class="spinner-container"><div class="spinner"></div></div>';


    const resultHTML = renderToString(zonaPagoInstancia.renderSpiner());

    assert.equal(resultHTML, expectedHTML, "debe retornar la plantilla");
  });
  it("renderSelectorSucursal devuelve la plantilla correcta", () => {

    const expectedHTML = '<label for="selectSucursal">Sucursal:</label><select required="" id="selectSucursal"><option value="">Seleccione una sucursal</option><option value="sa">Santa Ana</option><option value="sa">San Salvador</option><option value="sm">San Miguel</option></select>';


    const resultHTML = renderToString(zonaPagoInstancia.renderSelectorSucursal());

    assert.equal(resultHTML, expectedHTML, "debe retornar la plantilla");
  });

  it("renderPagosMultiples devuelve la plantilla correcta", () => {
    const expectedHTML =
      '<label>Pago 1:</label><select required=""><option value="">Seleccione una forma de pago</option><option value="cash">Efectivo</option><option value="banco">Transferencia Bancaria</option><option value="tDeb">Targeta Debito</option><option value="tCred">Targeta Credito</option></select><!--?--><label>Cantidad:</label><div class="containeInputBtnEliminar"><input type="text" inputmode="decimal" placeholder="Cantidad"><button class="btnEliminarSeccionPago"> x </button></div><label>Pago 2:</label><select required=""><option value="">Seleccione una forma de pago</option><option value="cash">Efectivo</option><option value="banco">Transferencia Bancaria</option><option value="tDeb">Targeta Debito</option><option value="tCred">Targeta Credito</option></select><!--?--><label>Cantidad:</label><div class="containeInputBtnEliminar"><input type="text" inputmode="decimal" placeholder="Cantidad"><button class="btnEliminarSeccionPago"> x </button></div><label>Pago 3:</label><select required=""><option value="">Seleccione una forma de pago</option><option value="cash">Efectivo</option><option value="banco">Transferencia Bancaria</option><option value="tDeb">Targeta Debito</option><option value="tCred">Targeta Credito</option></select><!--?--><label>Cantidad:</label><div class="containeInputBtnEliminar"><input type="text" inputmode="decimal" placeholder="Cantidad"><button class="btnEliminarSeccionPago"> x </button></div><button type="button"> Agregar pago </button><p style="color: red">Total pagado: $24.00</p>';

    const resultHTML = renderToString(zonaPagoInstancia.renderPagosMultiples());

    assert.equal(resultHTML, expectedHTML, "renderPagosMultiples debe retornar la plantilla correcta");
  });

  it("renderPagoIndividual devuelve la plantilla correcta para pago 0", () => {
    const pago = { forma: "efectivo", cantidad: 10 };
    const index = 0;

    const expectedHTML =
      '<label>Pago 1:</label><select required=""><option value="">Seleccione una forma de pago</option><option value="cash">Efectivo</option><option value="banco">Transferencia Bancaria</option><option value="tDeb">Targeta Debito</option><option value="tCred">Targeta Credito</option></select><label>Cantidad:</label><div class="containeInputBtnEliminar"><input type="text" inputmode="decimal" placeholder="Cantidad" value="10" ><button class="btnEliminarSeccionPago">x</button></div>';

    const resultHTML = renderToString(zonaPagoInstancia.renderPagoIndividual(pago, index));

    assert.include(resultHTML, '<label>Pago 1:</label>');
    assert.include(resultHTML, '<select required="">');
    assert.include(resultHTML, '<input type="text"');
  });

  it("renderTotalPagado devuelve la plantilla correcta con total en rojo", () => {
    const expectedHTML = '<p style="color: red">Total pagado: $24.00</p>';

    const resultHTML = renderToString(zonaPagoInstancia.renderTotalPagado());

    assert.equal(resultHTML, expectedHTML, "renderTotalPagado debe retornar la plantilla correcta");
  });

  it("renderSelectorFormaPago devuelve la plantilla correcta", () => {
    zonaPagoInstancia.sucursalSeleccionada = "sa"; // habilitar select

    const expectedHTML =
      '<label for="selectFormaPago">Forma de pago:</label><select required="" id="selectFormaPago"><option value="">Seleccione una forma de pago</option><option value="cash">Efectivo</option><option value="banco">Transferencia Bancaria</option><option value="tDeb">Targeta Debito</option><option value="tCred">Targeta Credito</option></select>';

    const resultHTML = renderToString(zonaPagoInstancia.renderSelectorFormaPago());

    assert.equal(resultHTML, expectedHTML, "renderSelectorFormaPago debe retornar la plantilla correcta");
  });

  it('crearOrden debería crear una orden y devolver su ID', async () => {
    fetchStub.resolves({
      headers: {
        get: () => 'v1/orden/456'
      },
      status: 201
    });

    const orden = { fecha: new Date().toISOString(), sucursal: 'Sa', activa: false };
    const response = await ordenAccess.createData(orden);
    const location = response.headers.get('Location');
    const idOrden = location.split('/').pop();

    assert.strictEqual(idOrden, '456');
    assert.strictEqual(response.status, 201);
    assert.strictEqual(fetchStub.firstCall.args[0], 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1/orden');
  });

  it('crearOrdenDetalles debería crear los detalles de una orden', async () => {
    fetchStub.resolves({ status: 200 });

    const detalle = {
      productoList: [{ idProducto: 1, cantidad: 2 }],
      comboList: [{ idCombo: 1, cantidad: 1 }]
    };

    const response = await ordenDetalleAccess.createDataMix(detalle, 456);
    assert.strictEqual(response.status, 200);
  });

  it('crearPago debería crear un pago y retornar su ID', async () => {
    fetchStub.resolves({
      headers: {
        get: () => 'v1/pago/789'
      },
      status: 201
    });

    const pago = {
      orden: { idOrden: 456 },
      forma: 'EFECTIVO',
      fecha: new Date().toISOString()
    };

    const response = await pagoAccess.createData(pago);
    const location = response.headers.get('Location');
    
    const idPago = location.split('/').pop();

    assert.strictEqual(idPago, '789');
    assert.strictEqual(response.status, 201);
  });

  it('crearPagoDetalles debería crear el detalle del pago', async () => {
    fetchStub.resolves({ status: 200 });

    const detalle = {
      idPago: { idPago: 789 },
      cantidad: 10.00
    };

    const response = await pagoDetalleAccess.createData(detalle, 789);
    assert.strictEqual(response.status, 200);
  });

  it('guardarOrdenOffline debería guardar una orden temporal en localStorage',() => {
    const idStub = sinon.stub(global.crypto, 'randomUUID').returns('id-mock');
    const sucursalSelecionada = "sa";
    const pagosSelecionados = [{ "forma": "cash", "cantidad": 2.3 }];
    const productos = {
      "productos": [
        {
          "idProducto": 1002,
          "nombre": "pepsi",
          "precio": 1.5,
          "cantidad": 1
        },
        {
          "idProducto": 1003,
          "nombre": "pupusas",
          "precio": 0.8,
          "cantidad": 1
        }
      ]
    };
    const combos = [];
    const orden = new Orden(null, "2025-05-29T23:17:26.356Z", "sa", false);
  
     zonaPagoInstancia.guardarOrdenOffline(
      orden,
      pagosSelecionados,
      sucursalSelecionada,
      productos,
      combos
    );
  
    const data = JSON.parse(localStorage.getItem('ordenesPendientes') || '[]'); 
    
    assert.strictEqual(data[0].idTemporal,"id-mock", 'id deberian ser los mismos');
    assert.strictEqual(data[0].productos.productos.length,2, 'cantidad de productos deberia ser 2');
    assert.strictEqual(data[0].combos.length,0, 'cantidda de combos deberia ser 0');
    assert.strictEqual(data[0].sucursalSelecionada,"sa", 'sucursal deberia ser sa');
  
    // Limpieza
    idStub.restore();
    localStorage.clear();
    
  });

  it('agregarEventoOrdenOffLine debería agregar un evento offline para pagar', async () => {
    const data = [
      {
        idTemporal: 'id-mock',
        orden: {
          idOrden: null,
          fecha: '2025-05-29T23:17:26.356Z',
          sucursal: 'sa',
          anulada: false
        },
        sucursalSelecionada: 'sa',
        pagosSeleccionados: [{ forma: 'cash', cantidad: 2.3 }],
        productos: { productos: [{ idProducto: 1, cantidad: 2 }] },
        combos: [],
        total: '30.00'
      }
    ];

    localStorage.setItem('ordenesPendientes', JSON.stringify(data));

    const pagarStub = sinon.stub(zonaPagoInstancia, 'buttonPagar').resolves();
    const volverStub = sinon.stub(zonaPagoInstancia, 'buttonVolver');

    zonaPagoInstancia.agregarEventoOrdenOffLine();
    window.dispatchEvent(new window.Event('online'));

    // Esperar a que el evento procese
    await new Promise(resolve => setTimeout(resolve, 10));

    assert(pagarStub.calledOnce, 'buttonPagar debería haberse llamado');
    assert(volverStub.calledOnce, 'buttonVolver debería haberse llamado');
    assert.isNull(localStorage.getItem('ordenesPendientes'), 'Debe eliminarse localStorage si todo fue exitoso');
  });
  
  


});



const data=[
  {"idTemporal":"id-mock",
    "sucursalSelecionada":"sa",
    "pagosSeleccionados":[{"forma":"cash","cantidad":2.3}],
    "productos":[{"idProducto":1002,"nombre":"pepsi","precio":1.5,"url":"https://farinapizzas.com.au/wp-content/uploads/2023/05/1.25L-Pepsi.jpg","cantidad":1},{"idProducto":1003,"nombre":"pupusas","precio":0.8,"url":"https://imag.bonviveur.com/pupusas-salvadorenas.webp","cantidad":1}],
    "combos":[],"total":"2.30"}]