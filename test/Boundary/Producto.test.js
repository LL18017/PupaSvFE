import { expect } from "chai";
import sinon from "sinon";
import "../../src/boundary/productos/Producto.js";

// Define la URL base de tu API para mantenerla consistente en los stubs.
const API_BASE_URL = 'http://localhost:9080/PupaSv-1.0-SNAPSHOT/v1';

describe('Producto Componente', () => {
    let productoComponent;
    let fetchStub;
    let attachShadowSpy;
    let consoleErrorStub;

    // Datos simulados para las respuestas de la API
    const mockProductos = [
        { idProducto: 1, nombre: 'Pupusa', url: 'url_prod_pupusa.jpg', productoPrecioList: [{ idProductoPrecio: 1, precioSugerido: 1.50 }] },
        { idProducto: 2, nombre: 'Atol', url: 'url_prod_atol.jpg', productoPrecioList: [{ idProductoPrecio: 2, precioSugerido: 2.75 }] },
        { idProducto: 3, nombre: 'Pizza', url: 'url_prod_pizza.jpg', productoPrecioList: [{ idProductoPrecio: 3, precioSugerido: 10.00 }] },
        { idProducto: 4, nombre: 'Tamal', url: 'url_prod_tamal.jpg', productoPrecioList: [{ idProductoPrecio: 4, precioSugerido: 1.25 }] },
        { idProducto: 5, nombre: 'Empanada', url: 'url_prod_empanada.jpg', productoPrecioList: [{ idProductoPrecio: 5, precioSugerido: 0.80 }] },
        { idProducto: 6, nombre: 'Yuca Frita', url: 'url_prod_yuca.jpg', productoPrecioList: [{ idProductoPrecio: 6, precioSugerido: 3.50 }] },
    ];
    const mockCombos = [
        {
            idCombo: 101, nombre: 'Combo Ultra', descripcion: 'Un combo genial', precio: 5.00, url: 'url_combo_ultra.jpg',
            comboDetalleList: [{ idProducto: 1, cantidad: 1 }, { idProducto: 2, cantidad: 1 }]
        },
        {
            idCombo: 102, nombre: 'Combo Mega', descripcion: 'Otro combo', precio: 15.00, url: 'url_combo_mega.jpg',
            comboDetalleList: [{ idProducto: 3, cantidad: 2 }]
        },
    ];

    beforeEach(async () => {

        document.body.innerHTML = '';
        sinon.restore();

        fetchStub = sinon.stub(global, 'fetch');

        // --- Configuración de Stubs para diferentes llamadas a la API ---
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .callsFake((url) => {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                const first = parseInt(urlParams.get('first'), 10);
                const max = parseInt(urlParams.get('max'), 10);
                const paginatedData = mockProductos.slice(first, first + max);
                return Promise.resolve(new Response(JSON.stringify(paginatedData), {
                    status: 200,
                    headers: { 'Total-records': mockProductos.length.toString() }
                }));
            });
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto/nombre/.+$`)))
            .callsFake((url) => {
                const name = url.split('/').pop();
                const filteredData = mockProductos.filter(p => p.nombre.toLowerCase().includes(name.toLowerCase()));
                return Promise.resolve(new Response(JSON.stringify(filteredData), { status: 200 }));
            });
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));

        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo$`)))
            .resolves(new Response(JSON.stringify(mockCombos), { status: 200 }));

        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo/nombre/.+$`)))
            .callsFake((url) => {
                const name = url.split('/').pop();
                const filteredData = mockCombos.filter(c =>
                    c.nombre.toLowerCase().includes(name.toLowerCase()) ||
                    c.descripcion.toLowerCase().includes(name.toLowerCase()) ||
                    (c.comboDetalleList && c.comboDetalleList.some(cd =>
                        mockProductos.find(p => p.idProducto === cd.idProducto)?.nombre.toLowerCase().includes(name.toLowerCase())
                    ))
                );
                return Promise.resolve(new Response(JSON.stringify(filteredData), { status: 200 }));
            });


        attachShadowSpy = sinon.spy(HTMLElement.prototype, 'attachShadow');
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        consoleErrorStub = sinon.stub(console, 'error');
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Se ejecuta después de cada prueba
    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = '';
    });

    // --- Pruebas del Constructor y `connectedCallback` ---
    it('debería instanciar correctamente el componente y sus propiedades iniciales', () => {
        expect(productoComponent).to.be.an.instanceOf(HTMLElement);
        expect(productoComponent.productoAccess).to.exist;
        expect(productoComponent.comboAccess).to.exist;
        expect(productoComponent.productos).to.be.an('array');
        expect(productoComponent.combos).to.be.an('array');
        expect(productoComponent.textoBusqueda).to.equal('');
        expect(productoComponent.filtroSeleccionado).to.equal('productos');
        expect(attachShadowSpy.calledOnce).to.be.true;
    });

    it('`connectedCallback` debería cargar los datos del producto correctamente y renderizar los productos inicialmente', async () => {
        expect(fetchStub.calledWith(sinon.match(`${API_BASE_URL}/producto?first=0&max=5`))).to.be.true;
        expect(productoComponent.productos).to.deep.equal(mockProductos.slice(0, 5));
        expect(productoComponent.productos.length).to.equal(5);
        expect(productoComponent.allProductosData).to.deep.equal(mockProductos);
        expect(productoComponent.allProductosData.length).to.equal(mockProductos.length);

        expect(productoComponent.totalPaginasProductos).to.equal(Math.ceil(mockProductos.length / productoComponent.elementosPorPagina));
        const renderedProductCards = productoComponent.shadowRoot.querySelectorAll('.list-producto-container .card');
        expect(renderedProductCards.length).to.equal(5);
        expect(renderedProductCards[0].querySelector('h3').textContent).to.include('Pupusa');
    });

    // --- Pruebas de Manejo de Errores para `fetch` ---
    it('debería manejar errores al obtener los productos', async () => {
        fetchStub.reset();
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .rejects(new Error('Network error during product fetch'));

        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));

        document.body.innerHTML = '';
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(consoleErrorStub.calledOnce).to.be.true;
        expect(consoleErrorStub.firstCall.args[0]).to.include('Error al aplicar filtros desde el servidor');
        expect(productoComponent.productos).to.deep.equal([]);
        expect(productoComponent.allProductosData).to.deep.equal([]);
        expect(productoComponent.totalPaginasProductos).to.equal(1);

        const shadowRoot = productoComponent.shadowRoot;
        const renderedProductCards = shadowRoot.querySelectorAll('.list-producto-container .card');
        expect(renderedProductCards.length).to.equal(0);
    });

    it('debería manejar errores al obtener los combos', async () => {
        fetchStub.reset();
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .resolves(new Response(JSON.stringify(mockProductos.slice(0, 5)), { status: 200, headers: { 'Total-records': mockProductos.length.toString() } }));

        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo$`))).rejects(new Error('Server error for combos'));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo/nombre/.+$`)))
            .rejects(new Error('Server error for combos by name'));

        // Cambia el filtro del componente a 'combos'
        productoComponent.filtroSeleccionado = 'combos';
        await productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 200));

        expect(consoleErrorStub.calledOnce).to.be.true;
        expect(consoleErrorStub.firstCall.args[0]).to.include('Error al aplicar filtros desde el servidor');
        expect(productoComponent.combos).to.deep.equal([]);
        expect(productoComponent.allCombosData).to.deep.equal([]);
        expect(productoComponent.totalPaginasCombos).to.equal(1);

        const shadowRoot = productoComponent.shadowRoot;
        const allVisibleH1s = shadowRoot.querySelectorAll('section:not([style*="display: none"]) h1');
        let comboSectionH1 = null;
        for (const h1Element of allVisibleH1s) {
            if (h1Element.textContent === 'Combos') {
                comboSectionH1 = h1Element;
                break;
            }
        }
        expect(comboSectionH1).to.exist;
        expect(comboSectionH1.textContent).to.equal('Combos');
        const renderedComboCards = shadowRoot.querySelectorAll('.list-combo-container .card');
        expect(renderedComboCards.length).to.equal(0);
    });

    //--- Pruebas para almacenar valor de búsqueda ---
    it('almacenarValorBusqueda', async () => {
        const applyFiltersSpy = sinon.spy(productoComponent, 'aplicarFiltros');
        const searchInput = productoComponent.shadowRoot.querySelector('input[type="text"]');

        searchInput.value = 'pizza';
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(productoComponent.textoBusqueda).to.equal('pizza');
        expect(productoComponent.paginaActualProductos).to.equal(1);
        expect(productoComponent.paginaActualCombos).to.equal(1);
        expect(productoComponent.allProductosData).to.deep.equal([mockProductos[2]]);
        expect(productoComponent.allCombosData).to.deep.equal([]);
        expect(applyFiltersSpy.calledOnce).to.be.true;

        expect(productoComponent.productos.length).to.equal(1);
        expect(productoComponent.productos[0].nombre).to.equal('Pizza');

        const renderedProducts = productoComponent.shadowRoot.querySelectorAll('.list-producto-container .card');
        expect(renderedProducts.length).to.equal(1);
        expect(renderedProducts[0].querySelector('h3').textContent).to.include('Pizza');
        applyFiltersSpy.restore();
    });

    // --- Prueba para agregar un producto ---
    it('`eventAgregarProducto` debería disparar un `CustomEvent` "productoSeleccionado"', (done) => {
        const mockProductToSelect = mockProductos[0];
        productoComponent.productos = [mockProductToSelect];
        productoComponent.renderProductos();

        productoComponent.addEventListener('productoSeleccionado', (e) => {
            try {
                expect(e.detail).to.deep.equal({
                    idProducto: mockProductToSelect.idProducto,
                    nombre: mockProductToSelect.nombre,
                    precio: mockProductToSelect.productoPrecioList[0].precioSugerido,
                    url: mockProductToSelect.url,
                });
                expect(e.bubbles).to.be.true;
                expect(e.composed).to.be.true;
                done();
            } catch (error) {
                done(error); // Pasa el error a done para que la prueba falle
            }
        });

        const productCard = productoComponent.shadowRoot.querySelector('.list-producto-container .card');
        expect(productCard).to.exist;
        const selectButton = productCard.querySelector('button#btnAgregar');
        expect(selectButton).to.exist;

        selectButton.click();
    });
    // --- Prueba para el evento de tecla Enter ---
    it('`eventoEnter` debería llamar a `aplicarFiltros` cuando se presiona Enter', async () => {
        const applyFiltersSpy = sinon.spy(productoComponent, 'aplicarFiltros');
        const enterEvent = new window.KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            composed: true,
        });
        document.dispatchEvent(enterEvent);
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(applyFiltersSpy.calledOnce).to.be.true;
        applyFiltersSpy.restore(); // Limpia el spy
    });

    // --- Pruebas de Paginación ---
    it('el botón `paginaSiguiente` debería estar deshabilitado en la última página de productos', async () => {
        productoComponent.paginaActualProductos = 2;
        productoComponent.productos = [];
        productoComponent.totalPaginasProductos = 2;
        productoComponent.renderProductos();
        await new Promise(resolve => setTimeout(resolve, 250));

        const nextButton = productoComponent.shadowRoot.querySelector('.paginacion-container button:last-child');
        expect(nextButton).to.exist;
        expect(nextButton.disabled).to.be.true;
    });

    it('el botón `paginaAnterior` debería estar deshabilitado en la primera página de productos', async () => {
        productoComponent.paginaActualProductos = 1;
        productoComponent.productos = mockProductos.slice(0, 5);
        productoComponent.totalPaginasProductos = 2;
        productoComponent.renderProductos();
        await new Promise(resolve => setTimeout(resolve, 250));

        const prevButton = productoComponent.shadowRoot.querySelector('.paginacion-container button:first-child');
        expect(prevButton).to.exist;
        expect(prevButton.disabled).to.be.true;
    });

    it('debería mostrar "No hay productos disponibles" cuando no hay productos', async () => {
        fetchStub.reset();
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200, headers: { 'Total-records': '0' } }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));

        document.body.innerHTML = '';
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        await new Promise(resolve => setTimeout(resolve, 150));

        const noDataMessage = productoComponent.shadowRoot.querySelector('.list-producto-container .no-disponible');
        expect(noDataMessage).to.exist;
        expect(noDataMessage.textContent).to.equal('No hay productos disponibles.');
        expect(productoComponent.totalPaginasProductos).to.equal(0);
    });

    it('debería mostrar "No hay productos disponibles" cuando no hay productos', async () => {
        fetchStub.reset();
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200, headers: { 'Total-records': '0' } }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));

        document.body.innerHTML = '';
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        await new Promise(resolve => setTimeout(resolve, 100));

        const noDataMessage = productoComponent.shadowRoot.querySelector('.list-producto-container .no-disponible');
        expect(noDataMessage).to.exist;
        expect(noDataMessage.textContent).to.equal('No hay productos disponibles.');
        expect(productoComponent.totalPaginasProductos).to.equal(0);
    });

    it('debería mostrar "No hay combos disponibles" cuando no hay combos', async () => {
        fetchStub.reset();
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .resolves(new Response(JSON.stringify(mockProductos.slice(0, 5)), { status: 200, headers: { 'Total-records': mockProductos.length.toString() } }));

        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo$`))).resolves(new Response(JSON.stringify([]), { status: 200 }));

        productoComponent.filtroSeleccionado = 'combos';
        await productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 100));

        const noDataMessage = productoComponent.shadowRoot.querySelector('.list-combo-container .no-disponible');
        expect(noDataMessage).to.exist;
        expect(noDataMessage.textContent).to.equal('No hay combos disponibles.');
        expect(productoComponent.totalPaginasCombos).to.equal(0);
    });

    it('debería mostrar el spinner de carga cuando `cargando` es `true`', async () => {
        fetchStub.reset();
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .returns(new Promise(resolve => {
                setTimeout(() => resolve(new Response(JSON.stringify(mockProductos.slice(0, 5)),
                    { status: 200, headers: { 'Total-records': mockProductos.length.toString() } })), 100);
            }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo$`)))
            .resolves(new Response(JSON.stringify(mockCombos), { status: 200 }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));


        document.body.innerHTML = '';
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(productoComponent.cargando).to.be.true;
        expect(productoComponent.shadowRoot.querySelector('.spinner')).to.exist;
        expect(productoComponent.shadowRoot.querySelector('.spinner').textContent).to.equal('Cargando...');

        await new Promise(resolve => setTimeout(resolve, 200));
        expect(productoComponent.cargando).to.be.false;
        expect(productoComponent.shadowRoot.querySelector('.spinner')).to.not.exist;
    });
});
