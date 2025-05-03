import dataAccess from "./dataAccess.js";

class ProductoAccess extends dataAccess{
    constructor() {
        super("producto"); // Pasa el valor específico para la subclase
    }
}

export default ProductoAccess;