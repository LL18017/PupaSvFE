import dataAccess from "../control/dataAccess.js";

const Acceso_a_datos = new dataAccess("tipoproducto");

const registro={activo: true, idTipoProducto: 9, nombre: 'frio'}


const data = Acceso_a_datos.getData(undefined, undefined, undefined);




data.then(response => {
    if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
    }
    return response.json();  
})
.then(data => {
    console.log("Los datos son:", data);
})
.catch(error => {
    console.error("Error:", error);
});
