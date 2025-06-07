import { expect } from "chai";
import sinon from "sinon";
import "../../src/boundary/productos/Producto.js"; 

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
        { idProducto: 7, nombre: 'Horchata', url: 'url_prod_horchata.jpg', productoPrecioList: [{ idProductoPrecio: 7, precioSugerido: 2.00 }] },
        { idProducto: 8, nombre: 'Chilate', url: 'url_prod_chilate.jpg', productoPrecioList: [{ idProductoPrecio: 8, precioSugerido: 2.25 }] },
        { idProducto: 9, nombre: 'Pan con Pavo', url: 'url_prod_panpavo.jpg', productoPrecioList: [{ idProductoPrecio: 9, precioSugerido: 4.00 }] },
        { idProducto: 10, nombre: 'Nuégados', url: 'url_prod_nuegados.jpg', productoPrecioList: [{ idProductoPrecio: 10, precioSugerido: 1.00 }] },
        { idProducto: 11, nombre: 'Cochinita', url: 'url_prod_cochinita.jpg', productoPrecioList: [{ idProductoPrecio: 11, precioSugerido: 6.00 }] },
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

    const setupSuccessfulFetchStubs = () => {
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify(mockProductos), { status: 200 }));

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
    };


    beforeEach(() => {
        document.body.innerHTML = ''; 
        sinon.restore(); 

        fetchStub = sinon.stub(global, 'fetch');
        attachShadowSpy = sinon.spy(HTMLElement.prototype, 'attachShadow');
        consoleErrorStub = sinon.stub(console, 'error'); 
    });

    afterEach(() => {
        sinon.restore(); 
        document.body.innerHTML = '';
    });

    // --- Pruebas del Constructor y `connectedCallback` ---
    it('debería instanciar correctamente el componente y sus propiedades iniciales', () => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);

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
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        setupSuccessfulFetchStubs(); 
        productoComponent.connectedCallback(); 
        await new Promise(resolve => setTimeout(resolve, 600)); 
    
        expect(fetchStub.calledWith(sinon.match(`${API_BASE_URL}/producto`))).to.be.true;
        expect(fetchStub.calledWith(sinon.match(`${API_BASE_URL}/producto?first=0&max=10`))).to.be.true;
        expect(productoComponent.productos).to.deep.equal(mockProductos.slice(0, 10));
        expect(productoComponent.productos.length).to.equal(Math.min(mockProductos.length, 10)); 

        expect(productoComponent.allProductosData).to.deep.equal([]); 
        
        expect(productoComponent.totalPaginasProductos).to.equal(Math.ceil(mockProductos.length / productoComponent.elementosPorPagina));
        const renderedProductCards = productoComponent.shadowRoot.querySelectorAll('.list-producto-container .card');
        expect(renderedProductCards.length).to.equal(Math.min(mockProductos.length, 10)); 
        expect(renderedProductCards[0].querySelector('h3').textContent).to.include('Pupusa');
    });
    // --- Prueba para agregar un producto ---
    it('`eventAgregarProducto` debería disparar un `CustomEvent` "productoSeleccionado"', (done) => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        setupSuccessfulFetchStubs();
        productoComponent.connectedCallback();
        productoComponent.productos = mockProductos.slice(0, 1); 
        productoComponent.renderProductos(); 

        const mockProductToSelect = mockProductos[0];
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
                done(error); 
            }
        });

        // Simula el click en el botón "Seleccionar"
        const productCard = productoComponent.shadowRoot.querySelector('.list-producto-container .card');
        expect(productCard).to.exist;
        const selectButton = productCard.querySelector('button#btnAgregar');
        expect(selectButton).to.exist;
        selectButton.click();
    });
    
    // --- Prueba para el evento de tecla Enter ---
    it('`eventoEnter` debería llamar a `aplicarFiltros` cuando se presiona Enter globalmente', (done) => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        setupSuccessfulFetchStubs(); 
        productoComponent.connectedCallback(); 
        setTimeout(() => { 
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
            setTimeout(() => { 
                try {
                    expect(applyFiltersSpy.calledOnce).to.be.true;
                    applyFiltersSpy.restore(); 
                    done();
                } catch (e) {
                    done(e);
                }
            }, 100); 
        }, 600);
    });

    // --- Pruebas de Paginación ---
    it('el botón `paginaSiguiente` debería estar deshabilitado en la última página de productos', async () => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        setupSuccessfulFetchStubs(); 
        productoComponent.connectedCallback(); 
        await new Promise(resolve => setTimeout(resolve, 600)); 

        productoComponent.paginaActualProductos = productoComponent.totalPaginasProductos; 
        await productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 250)); 

        const nextButton = productoComponent.shadowRoot.querySelector('.paginacion-container button:last-child');
        expect(nextButton).to.exist;
        expect(nextButton.disabled).to.be.true;
    });

    it('el botón `paginaAnterior` debería estar deshabilitado en la primera página de productos', async () => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        setupSuccessfulFetchStubs(); 
        productoComponent.connectedCallback();
        await new Promise(resolve => setTimeout(resolve, 600)); 
        productoComponent.paginaActualProductos = 1; 
        await productoComponent.aplicarFiltros();
        await new Promise(resolve => setTimeout(resolve, 250)); 

        const prevButton = productoComponent.shadowRoot.querySelector('.paginacion-container button:first-child');
        expect(prevButton).to.exist;
        expect(prevButton.disabled).to.be.true;
    });

    it('debería mostrar "No hay productos disponibles" cuando no hay productos', async () => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
      
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200, headers: { 'Total-records': '0' } }));
        
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));

        productoComponent.connectedCallback();
        await new Promise(resolve => setTimeout(resolve, 600)); 

        const noDataMessage = productoComponent.shadowRoot.querySelector('.list-producto-container .no-disponible');
        expect(noDataMessage).to.exist;
        expect(noDataMessage.textContent).to.equal('No hay productos disponibles.');
        expect(productoComponent.totalPaginasProductos).to.equal(0); 

        const errorMessageDiv = productoComponent.shadowRoot.querySelector('.error-mensaje');
        expect(errorMessageDiv).to.not.exist; 
    });

    it('debería mostrar el spinner de carga cuando `cargando` es `true` y ocultarlo después', async () => {
        productoComponent = document.createElement('producto-plantilla');
        document.body.appendChild(productoComponent);
        
        fetchStub.resetBehavior(); 

        let resolveProductMapFetch;
        let resolvePaginatedProductFetch;

        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto$`)))
            .returns(new Promise(resolve => { resolveProductMapFetch = resolve; }));
        
        
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto\\?first=\\d+&max=\\d+$`)))
            .returns(new Promise(resolve => { resolvePaginatedProductFetch = resolve; }));
        
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/producto/nombre/.+$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo$`)))
            .resolves(new Response(JSON.stringify(mockCombos), { status: 200 }));
        fetchStub.withArgs(sinon.match(new RegExp(`^${API_BASE_URL.replace(/\//g, '\\/')}/combo/nombre/.+$`)))
            .resolves(new Response(JSON.stringify([]), { status: 200 }));

        productoComponent.connectedCallback(); 
        await new Promise(resolve => setTimeout(resolve, 10)); 

        expect(productoComponent.cargando).to.be.true;
        const spinnerElement = productoComponent.shadowRoot.querySelector('.spinner');
        expect(spinnerElement).to.exist;
        expect(spinnerElement.textContent).to.equal('Cargando...');

        
        resolveProductMapFetch(new Response(JSON.stringify(mockProductos), { status: 200 }));
        await new Promise(resolve => setTimeout(resolve, 50)); 

        resolvePaginatedProductFetch(new Response(JSON.stringify(mockProductos.slice(0, 10)), 
            { status: 200, headers: { 'Total-records': mockProductos.length.toString() } }));
            
        await new Promise(resolve => setTimeout(resolve, 300)); 
        expect(productoComponent.cargando).to.be.false;
        expect(productoComponent.shadowRoot.querySelector('.spinner')).to.not.exist;
    });
});
