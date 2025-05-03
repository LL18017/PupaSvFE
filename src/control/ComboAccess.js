import dataAccess from "./dataAccess.js";

class ComboAccess extends dataAccess{
    constructor() {
        super("combo"); // Pasa el valor específico para la subclase
    }
}

export default ComboAccess;