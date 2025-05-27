import { JSDOM } from "jsdom";

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: "http://localhost",
    pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;

// Redefinimos global.navigator como una propiedad de solo lectura que devuelve dom.window.navigator
Object.defineProperty(global, 'navigator', {
    configurable: true,
    enumerable: true,
    get: () => dom.window.navigator,
});

global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.CustomEvent = dom.window.CustomEvent;
global.localStorage = dom.window.localStorage;
