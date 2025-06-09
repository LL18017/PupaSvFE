import { JSDOM } from "jsdom";
import sinon from 'sinon';


const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: "http://localhost",
    pretendToBeVisual: true,
    resources: 'usable',
    runScripts: 'dangerously',
});

global.window = dom.window;
global.document = dom.window.document;
global.KeyboardEvent = dom.window.KeyboardEvent;

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
global.Event = dom.window.Event;

if (typeof global.window.fetch === 'undefined' || typeof global.window.fetch !== 'function') {
    global.window.fetch = sinon.stub().returns(Promise.resolve({ // Retorna un objeto Promise-like
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    }));
} else {
}
if (typeof global.window.fetch === 'undefined' || typeof global.window.fetch !== 'function') {
    global.window.fetch = function() {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({}), 
            text: () => Promise.resolve(''), 
        });
    };
}
global.fetch = global.window.fetch;

if (!global.crypto || typeof global.crypto.randomUUID !== 'function') {
    global.crypto = {
        randomUUID: () => 'id-mock',
    };
}

