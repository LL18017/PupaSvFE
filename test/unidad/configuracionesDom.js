import { JSDOM } from "jsdom";

// Creamos un DOM simulado

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: "http://localhost", // ✅ Esto habilita localStorage
    pretendToBeVisual: true,
});

// Exponemos los objetos globales que necesitan los componentes
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.CustomEvent = dom.window.CustomEvent;
global.localStorage = dom.window.localStorage;


