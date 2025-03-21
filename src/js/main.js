import dataAccess from "../control/dataAccess.js";
import Interactividad from "./interactividad.js";

const Acceso_a_datos = new dataAccess("tipoproducto");

// const registro={activo: true, idTipoProducto: 9, nombre: 'frio'}


// const data = Acceso_a_datos.getData(undefined, undefined, undefined);

// data.then(response => {
//     if (!response.ok) {
//         throw new Error(`Error en la solicitud: ${response.status}`);
//     }
//     return response.json();  
// })
// .then(data => {
//     console.log("Los datos son:", data);
// })
// .catch(error => {
//     console.error("Error:", error);
// });

const cambiar = new Interactividad();

const menuButtonAbrir = document.getElementById('menu-button-abrir');
const menuButtonCerrar = document.getElementById('menu-button-cerrar');
const navMenu = document.getElementById('navMenu');

// Función para abrir el menú
menuButtonAbrir.addEventListener('click', () => {
    cambiar.cambiarPropiedad("navMenu", "display", "block", "none");
    cambiar.cambiarPropiedad("menu-button-cerrar", "display", "block", "none");

});
// Función para abrir el menú
menuButtonCerrar.addEventListener('click', () => {
    cambiar.cambiarPropiedad("navMenu", "display", "none", "block");
    cambiar.cambiarPropiedad("menu-button-cerrar", "display", "none", "block");
});
