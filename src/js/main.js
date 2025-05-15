import dataAccess from "../control/dataAccess.js";
import Interactividad from "./interactividad.js";

const mainTittle = document.getElementById("main-tittle");
const navBar = document.getElementById("nav-bar");
const productosContainer = document.getElementById("productos-container");
const info = document.getElementById("info");
const footer = document.getElementById("footer");
const botonProbarproducto1 = document.getElementById("botonProbarproducto1");
const botonProbarproducto2 = document.getElementById("botonProbarproducto2");
const botonProbarcombo = document.getElementById("botonProbarcombo");
const cartCard = document.getElementById("cartCard");

navBar.addEventListener("inicioClick", (e) => {
  alert(`el elemento ${e.detail.element} dice ' ${e.detail.mensaje} '`);
  productosContainer.style.display = "none";
  info.style.display = "block";
  mainTittle.style.display = "block";
  footer.style.display = "block";
  mainTittle.style.display = "block";
 
});
navBar.addEventListener("menuClick", (e) => {
  alert(`el elemento ${e.detail.element} dice ' ${e.detail.mensaje}'`);
  productosContainer.style.display = "block";
  mainTittle.style.display = "none";
  info.style.display = "none";
  footer.style.display = "none";
  productosContainer.renderProductos();
});
navBar.addEventListener("contactoClick", (e) =>
  alert(`el elemento ${e.detail.element} dice ' ${e.detail.mensaje}'`)
);
navBar.addEventListener("deliveryClick", (e) =>
  alert(`el elemento ${e.detail.element} dice ' ${e.detail.mensaje}' `)
);
navBar.addEventListener("cartClick", (e) =>
  console.log(
    `el elemento ${e.detail.element} dice ' ${e.detail.mensaje}' y tienen como cuerpo, 
    id:${e.detail.body.id} 
    nombre: ${e.detail.body.nombre}`
  )
);
navBar.addEventListener("eliminarItemCart", (e) =>{

  navBar.itemEliminado()
}

);
navBar.addEventListener("agregarItemCart", (e) =>{
  
  console.log("se esta egpu")
  navBar.itemAgregado()
}
);

productosContainer.addEventListener("productoSeleccionado", (e) =>
  console.log(`el producto ${e.detail.nombre} dice ' ${e.detail.precio}' `)
);
productosContainer.addEventListener("comboSeleccionado", (e) =>
  console.log(`el combo ${e.detail.nombre}`)
);

botonProbarproducto1.addEventListener("click", () => {
  navBar.productoAgregado({
    nombre: 'coca',
    idProducto:1,
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNKD4uQkcygT38Vm8luf2QrP84OpENDHcXOg&s",
    precio:12.50,
  })}
);
botonProbarproducto2.addEventListener("click", () => {
  navBar.productoAgregado({
    nombre: 'pupusa',
    idProducto:2,
    url: "https://imag.bonviveur.com/pupusas-salvadorenas.webp",
    precio:12.50,
  })});
  botonProbarcombo.addEventListener("click", () => {
  navBar.comboAgregado({
    nombre: 'combo amigos',
    idCombo:1,
    url: "https://imag.bonviveur.com/pupusas-salvadorenas.webp",
    precio:12.50,
  })});


