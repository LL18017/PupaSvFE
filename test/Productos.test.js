import { expect } from "chai";
import sinon from "sinon";
import '../src/boundary/productos/Producto.js';

describe('Productos Componente', () => {
    let productoComponent;
    let fetchStub;
    let attachShadowSpy;

    let consoleErrorStub;
    // Datos simulados para las respuestas de la API
    const mockProductos = [
        { idProducto: 1, nombre: 'Producto Pupusa', url: 'url_prod_pupusa.jpg', productoPrecioList: [{ precioSugerido: 1 }] },
        { idProducto: 2, nombre: 'Producto Atol', url: 'url_prod_atol.jpg', productoPrecioList: [{ precioSugerido: 2 }] },
        { idProducto: 3, nombre: 'Producto Pizza', url: 'url_prod_pizza.jpg', productoPrecioList: [{ precioSugerido: 10 }] },
    ];

    const mockCombos = [
        { idCombo: 101, nombre: 'Combo Ultra', descripcion: 'Un combo genial', precio: 1, url: 'url_combo_ultra.jpg', comboDetalleList: [{ idProducto: 1, cantidad: 1 }, { idProducto: 2, cantidad: 1 }] },
        { idCombo: 102, nombre: 'Combo Mega', descripcion: 'Otro combo', precio: 15, url: 'url_combo_mega.jpg', comboDetalleList: [{ idProducto: 3, cantidad: 2 }] },
    ];

    beforeEach(async () => {
        document.body.innerHTML = '';

        sinon.restore();

        fetchStub = sinon.stub(global, 'fetch');

        // Configura las respuestas de `fetch` para las URLS.
        fetchStub.withArgs(sinon.match(/producto$/)).resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));
        fetchStub.withArgs(sinon.match(/combo$/)).resolves(new Response(JSON.stringify(mockCombos), { status: 200 }));

        attachShadowSpy = sinon.spy(HTMLElement.prototype, 'attachShadow');
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        consoleErrorStub = sinon.stub(console, 'error');

        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(() => {
        sinon.restore();
        document.body.innerHTML = '';
    });

    // --- Pruebas del Constructor y connectedCallback ---
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

    it('connectedCallback debería cargar los datos correctamente de productos y combos', async () => {
        expect(fetchStub.calledTwice).to.be.true;
        expect(fetchStub.firstCall.args[0]).to.include('producto');
        expect(fetchStub.secondCall.args[0]).to.include('combo');

        expect(productoComponent.productosOriginales).to.deep.equal(mockProductos);
        expect(productoComponent.combosOriginales[0].nombresProductosIncluidos).to.deep.equal(['Producto Pupusa', 'Producto Atol']);
    });

    // -----preubas de errores global.fech-----
    it('debería manejar errores al obtener los productos', async () => {
        fetchStub.reset();

        fetchStub.withArgs(sinon.match(/producto$/)).resolves(new Response(JSON.stringify([]), { status: 500, statusText: 'Internal Server Error' }));
        fetchStub.withArgs(sinon.match(/combo$/)).resolves(new Response(JSON.stringify(mockCombos), { status: 200 }));


        document.body.innerHTML = '';
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);

        await new Promise(resolve => setTimeout(resolve, 500));

        expect(productoComponent.productos).to.deep.equal([]);
        expect(productoComponent.productosOriginales).to.deep.equal([]);

        const shadowRoot = productoComponent.shadowRoot;
        expect(shadowRoot.querySelector('.list-producto-container .no-disponible').textContent).to.equal('No hay productos disponibles.');
    });

    it('debería manejar errores al obtener los combos', async () => {
        fetchStub.restore();
        fetchStub = sinon.stub(global, 'fetch');

        // Productos bien, combos fallan
        fetchStub.withArgs(sinon.match(/producto$/)).resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));
        fetchStub.withArgs(sinon.match(/combo$/)).returns(Promise.reject(new Error('Server error for combos')));

        document.body.innerHTML = '';
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(productoComponent.combos).to.deep.equal([]);
        expect(productoComponent.combosOriginales).to.deep.equal([]);
        expect(consoleErrorStub.calledOnce).to.be.true;
        expect(consoleErrorStub.firstCall.args[0]).to.include('Error al obtener los combos');

        // Cambiar filtro para ver combos y verificar mensaje
        productoComponent.filtroSeleccionado = 'combos';
        productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(productoComponent.shadowRoot.querySelector('.list-combo-container .no-disponible').textContent).to.equal('No hay combos disponibles.');
    });

    //-----Prueba para almacenar valor de busqueda-----
    it('almacenarValorBusqueda debería actualizar textoBusqueda', async () => {
        const inputEvent = new window.Event('input', { bubbles: true, composed: true });
        const searchInput = productoComponent.shadowRoot.querySelector('input[type="text"]');
        searchInput.value = 'mi busqueda';
        searchInput.dispatchEvent(inputEvent);

        expect(productoComponent.textoBusqueda).to.equal('mi busqueda');
    });

    //-----Prueba para aplicar filtros productos-----
    it('aplicarFiltros debería filtrar productos por texto de búsqueda y renderizar', async () => {
        productoComponent.textoBusqueda = 'atol';
        productoComponent.filtroSeleccionado = 'productos';
        productoComponent.aplicarFiltros();

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(productoComponent.productos.length).to.equal(1);
        expect(productoComponent.productos[0].nombre).to.equal('Producto Atol');

        const renderedProducts = productoComponent.shadowRoot.querySelectorAll('.list-producto-container .card');
        expect(renderedProducts.length).to.equal(1);
        expect(renderedProducts[0].querySelector('h3').textContent).to.include('Producto Atol');
    });

    //-----Prueba para aplicar filtros combos-----
    it('aplicarFiltros debería filtrar combos por nombre o descripción', async () => {
        productoComponent.textoBusqueda = 'combo ultra';
        productoComponent.filtroSeleccionado = 'combos';
        productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(productoComponent.combos.length).to.equal(1);
        expect(productoComponent.combos[0].nombre).to.equal('Combo Ultra');

        const renderedCombos = productoComponent.shadowRoot.querySelectorAll('.list-combo-container .card');
        expect(renderedCombos.length).to.equal(1);
        expect(renderedCombos[0].querySelector('h3').textContent).to.include('Combo Ultra');
    });


    it('aplicarFiltros debería filtrar combos por nombres de productos incluidos', async () => {
        productoComponent.textoBusqueda = 'Producto Pupusa';
        productoComponent.filtroSeleccionado = 'combos';
        productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(productoComponent.combos.length).to.equal(1);
        expect(productoComponent.combos[0].nombre).to.equal('Combo Ultra');

        const renderedCombos = productoComponent.shadowRoot.querySelectorAll('.list-combo-container .card');
        expect(renderedCombos.length).to.equal(1);
        expect(renderedCombos[0].querySelector('h3').textContent).to.include('Combo Ultra');
    });

    //-----Prueba para cambiar filtor-----
    it('cambiarFiltro debería alternar entre productos y combos', async () => {
        expect(productoComponent.productos.length).to.equal(mockProductos.length);
        expect(productoComponent.combos.length).to.equal(0);

        //Cambio del filtro a 'combos'
        const selectElement = productoComponent.shadowRoot.querySelector('select');
        selectElement.value = 'combos';
        selectElement.dispatchEvent(new window.Event('change', { bubbles: true, composed: true }));
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(productoComponent.filtroSeleccionado).to.equal('combos');
        expect(productoComponent.productos.length).to.equal(0);
        expect(productoComponent.combos.length).to.equal(mockCombos.length);
        expect(productoComponent.shadowRoot.querySelectorAll('.list-producto-container .card').length).to.equal(0);
        expect(productoComponent.shadowRoot.querySelectorAll('.list-combo-container .card').length).to.equal(mockCombos.length);

        //Cambio del filtro de vuelta a 'productos'
        selectElement.value = 'productos';
        selectElement.dispatchEvent(new window.Event('change', { bubbles: true, composed: true }));
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(productoComponent.filtroSeleccionado).to.equal('productos');
        expect(productoComponent.productos.length).to.equal(mockProductos.length);
        expect(productoComponent.combos.length).to.equal(0);
        expect(productoComponent.shadowRoot.querySelectorAll('.list-producto-container .card').length).to.equal(mockProductos.length);
        expect(productoComponent.shadowRoot.querySelectorAll('.list-combo-container .card').length).to.equal(0);
    });

    //-----Prueba para agregar un producto-----
    it('eventAgregarProducto debería disparar un CustomEvent "productoSeleccionado"', (done) => {
        const mockProducto = mockProductos[0];
        productoComponent.addEventListener('productoSeleccionado', (e) => {
            try {
                expect(e.detail).to.deep.equal({
                    idProducto: mockProducto.idProducto,
                    nombre: mockProducto.nombre,
                    precio: mockProducto.productoPrecioList[0].precioSugerido,
                    url: mockProducto.url,
                });
                expect(e.bubbles).to.be.true;
                expect(e.composed).to.be.true;
                done();
            } catch (error) {
                console.error('DEBUG: Error en las aserciones del CustomEvent:', error);
                done(error);
            }
        });
        const productoCard = productoComponent.shadowRoot.querySelector('.list-producto-container .card');
        if (!productoCard) {
            return done(new Error('ERROR: Tarjeta de producto no encontrada en el Shadow DOM. Verifica tu template.'));
        }

        const selectButton = productoCard.querySelector('button#btnAgregar');
        if (!selectButton) {
            return done(new Error('ERROR: Botón "Agregar" no encontrado en la tarjeta de producto. Verifica el ID.'));
        }
        selectButton.click();
    });

    //-----Prueba para agregar un producto-----
    it('eventAgregarCombo debería disparar un CustomEvent "comboSeleccionado"', (done) => {

        //Cambio del filtro a 'combos'
        const selectElement = productoComponent.shadowRoot.querySelector('select');
        selectElement.value = 'combos';
        selectElement.dispatchEvent(new window.Event('change', { bubbles: true, composed: true }));
        const mockCombo = mockCombos[0];
        productoComponent.addEventListener('comboSeleccionado', (e) => {
            try {
                expect(e.detail).to.deep.equal({
                    idCombo: mockCombo.idCombo,
                    nombre: mockCombo.nombre,
                    precio: mockCombo.precio,
                    url: mockCombo.url,
                });
                expect(e.bubbles).to.be.true;
                expect(e.composed).to.be.true;
                done();
            } catch (error) {
                console.error('DEBUG: Error en las aserciones del CustomEvent:', error);
                done(error);
            }
        });
        const comboCard = productoComponent.shadowRoot.querySelector('.list-combo-container .card');

        if (!comboCard) {
            return done(new Error('ERROR: Tarjeta de combo no encontrada en el Shadow DOM. Verifica tu template.'));
        }

        const selectButton = comboCard.querySelector('button#btnAgregar');
        if (!selectButton) {
            return done(new Error('ERROR: Botón "Agregar" no encontrado en la tarjeta de producto. Verifica el ID.'));
        }
        selectButton.click();
    });

    //-----Prueba para cuando se preciona enter-----
    it('eventoEnter debería llamar a aplicarFiltros cuando se presiona Enter', async () => {
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
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(applyFiltersSpy.calledOnce).to.be.true;
        applyFiltersSpy.restore();
    });


})
