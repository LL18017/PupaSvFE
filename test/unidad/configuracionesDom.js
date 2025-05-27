import { JSDOM } from "jsdom";

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: "http://localhost",
    pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;

// NO reasignar global.navigator, solo usar el del dom
// Si necesitas modificar userAgent, hazlo así:
Object.defineProperty(global.window.navigator, 'userAgent', {
    value: 'node.js',
    configurable: true,
    writable: false,
    enumerable: true
});

global.navigator = global.window.navigator;

global.HTMLElement = global.window.HTMLElement;
global.customElements = global.window.customElements;
global.CustomEvent = global.window.CustomEvent;
global.localStorage = global.window.localStorage;
