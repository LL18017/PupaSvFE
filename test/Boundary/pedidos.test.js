import assert from "assert";
import sinon from "sinon";
import { carritoState } from "../../src/boundary/cart/carritoState.js";  // Ajusta ruta si hace falta
import "../../src/boundary/pedidos/Pedidos.js"; // O donde definas tu custom element

describe("PedidosCliente component", function () {
    let pedidosElement;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        localStorage.clear();
        pedidosElement = document.createElement("pedidos-cliente");
        document.body.appendChild(pedidosElement);
    });

    afterEach(() => {
        sandbox.restore();
        pedidosElement.remove();
    });

    it("Muestra mensaje cuando no hay órdenes", function () {
        pedidosElement.render();
        const shadow = pedidosElement.shadowRoot;
        assert(shadow.innerHTML.includes("No hay información aún"));
    });

    it("Renderiza ordenes guardadas", function () {
        const ordenes = [
            {
                idOrden: "123",
                productos: [
                    { nombre: "Producto A", cantidad: 2, precio: 10 },
                    { nombre: "Producto B", cantidad: 1, precio: 5 },
                ],
                combos: [],
                total: 25,
            },
        ];
        localStorage.setItem("ordenes_pupa_tpi", JSON.stringify(ordenes));

        pedidosElement.render();

        const shadow = pedidosElement.shadowRoot;
        assert(shadow.innerHTML.includes("Número de orden:"));
        assert(shadow.innerHTML.includes("Producto A"));
        assert(shadow.textContent.includes("$20.00"));
        assert(shadow.textContent.includes("Total: $25"));
    });


    it("Renderiza ordenes pendienetes", function () {
        const data = [
            {
                idTemporal: "id-mock1",
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
        let ordenesPendientes = JSON.parse(localStorage.getItem('ordenesPendientes')) || [];
        pedidosElement.render();
        const shadow = pedidosElement.shadowRoot;
        assert(shadow.innerHTML.includes("id-mock1"));
        assert(shadow.textContent.includes("$30.00"));
        localStorage.clear();


    });

    it("Muestra mensaje cuando no hay órdenes", function () {
        pedidosElement.render();
        const shadow = pedidosElement.shadowRoot;
        assert(shadow.innerHTML.includes("No hay información aún"));
    });

    it("btnPedir actualiza carritoState y notifica", function () {
        const stubSetProductos = sandbox.stub(carritoState, "setProductos");
        const stubSetCombos = sandbox.stub(carritoState, "setCombos");
        const stubSetCantidadTotal = sandbox.stub(carritoState, "setCantidadTotal");
        const stubNotify = sandbox.stub(carritoState, "_notify");

        const orden = {
            productos: [
                { cantidad: 2 },
                { cantidad: 3 },
            ],
            combos: [
                { cantidad: 1 },
            ],
        };

        pedidosElement.btnPedir(orden);

        // Comprueba que se llamaron los métodos con los datos correctos
        assert(stubSetProductos.calledOnceWithExactly(orden.productos));
        assert(stubSetCombos.calledOnceWithExactly(orden.combos));
        // total cantidad: 2+3+1=6
        assert(stubSetCantidadTotal.calledOnceWithExactly(6));
        assert(stubNotify.calledOnce);
    });
    it("btnCancelarOrdenPendiente elimina un ordenPendiente del localSTorage", function () {
        const idEliminar = 'id-mock1';
        const data = [
            {
                idTemporal: idEliminar,
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
            },
            {
                idTemporal: 'id-mock2',
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
        pedidosElement.btnCancelarOrdenPendiente(idEliminar)
        const ordenesPendientes = JSON.parse(localStorage.getItem('ordenesPendientes')) || [];
        assert.strictEqual(ordenesPendientes.find(o => o.idTemporal === idEliminar),undefined,"No debe haber un registro con ese id");
        assert.strictEqual(ordenesPendientes.length,1,"Debe quedar solo una orden pendiente");
        localStorage.clear();




    });
   
});
