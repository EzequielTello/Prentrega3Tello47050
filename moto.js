// Molde
class Producto {
  constructor(id, nombre, precio, categoria, imagen) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
  }
}

// Clase base de datos del e-commerce, todos los productos del comercio

class BaseDeDatos {
  constructor() {
    // Array para los productos del comercio
    this.productos = [];
    // Empezar a cargar productos
    this.cargarRegistros();
  }

  // Función asincrónica para cargar los productos desde un JSON
  async cargarRegistros() {
    const resultado = await fetch("./json/productos.json");
    this.productos = await resultado.json();
    cargarProductos(this.productos);
  }

  // Nos devuelve catálogo de productos
  traerRegistros() {
    return this.productos;
  }

  // Nos devuelve un producto según el ID
  registroPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  // Nos devuelve un array con todas las coincidencias que encuentre
  registrosPorNombre(palabra) {
    return this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(palabra.toLowerCase())
    );
  }
}

// Clase carrito
class Carrito {
  constructor() {
    // Storage
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
    // Array donde almacena todos los productos del carrito
    this.carrito = carritoStorage || [];
    this.total = 0; //  Total de  precios de todos los productos
    this.cantidadProductos = 0; // Cantidad de productos que tenemos en el carrito

    this.listar();
  }

  // Método para saber si el producto ya se encuentra en el carrito
  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  // Agregar al carrito
  agregar(producto) {
    const productoEnCarrito = this.estaEnCarrito(producto);
    // Si no está en el carrito, realizo push y le agrego
    // la propiedad "cantidad"
    if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
    } else {
      // Si ya está en el carrito, le sumo en 1 la cantidad
      productoEnCarrito.cantidad++;
    }
    // Actualizo el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Muestro los productos en el HTML
    this.listar();
  }

  // Quitar del carrito
  quitar(id) {
    // Tengo el índice de un producto según el ID, porque el
    // método splice requiere el índice
    const indice = this.carrito.findIndex((producto) => producto.id === id);
    // Si la cantidad es mayor a 1, le resto la cantidad en 1
    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      // Y sino, borramos del carrito el producto a quitar
      this.carrito.splice(indice, 1);
    }
    // Actualizo el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Muestro los productos en el HTML
    this.listar();
  }

  // Procesa todos los productos en el HTML
  listar() {
    // Reiniciamos variables
    this.total = 0;
    this.cantidadProductos = 0;
    divCarrito.innerHTML = "";
    // Recorro producto por producto del carrito, y los dibujo en el HTML
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
          <div class="productoCarrito">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <a href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</a>
          </div>
        `;
      // Actualizamos totales
      this.total += producto.precio * producto.cantidad;
      this.cantidadProductos += producto.cantidad;
    }
    if (this.cantidadProductos > 0) {
      // Botón comprar visible
      botonComprar.style.display = "block";
    } else {
      // Botón comprar invisible
      botonComprar.style.display = "none";
    }
    // Como no se cuantos productos hay en el carrito, les
    // asigno los eventos de forma dinámica a cada uno
    // Primero hago una lista de todos los botones con .querySelectorAll
    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    // Después los recorro uno por uno y les asigno el evento a cada uno
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        // Obtengo el id por el dataset (está asignado en this.listar())
        const idProducto = Number(boton.dataset.id);
        // Llamo al método quitar pasándole el ID del producto
        this.quitar(idProducto);
      });
    }
    // Actualizo los contadores del HTML
    spanCantidadProductos.innerText = this.cantidadProductos;
    spanTotalCarrito.innerText = this.total;
  }
}

// Instanciamos la base de datos
const bd = new BaseDeDatos();

// Elementos
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("h2");
const botonCerrarCarrito = document.querySelector("#cerrarCarrito");

// Instaciamos la clase Carrito
const carrito = new Carrito();

// Mostramos el catálogo de la base de datos apenas carga la página
cargarProductos(bd.traerRegistros());

// Función mostrar para procesar productos del catálogo o buscador
function cargarProductos(productos) {
  // Vacíamos el div
  divProductos.innerHTML = "";
  // Recorremos producto por producto y lo dibujamos en el HTML
  for (const producto of productos) {
    divProductos.innerHTML += `
        <div class="producto card col-md-3">
          <h3>${producto.nombre}</h3>
          <p class="precio">$${producto.precio}</p>
          <div class="imagen">
            <img src="img/${producto.imagen}" />
          </div>
          <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
        </div>
      `;
  }

  // Lista dinámica de los botones que hay en nuestro catálogo
  const botonesAgregar = document.querySelectorAll(".btnAgregar");

  // Recorremos botón por botón de cada producto en el catálogo y le agregamos
  // el evento click a cada uno
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      event.preventDefault();
      // Guardo el dataset ID que está en el HTML del botón Agregar al carrito
      const idProducto = Number(boton.dataset.id);
      // Uso el método de la base de datos para ubicar el producto según el ID
      const producto = bd.registroPorId(idProducto);
      // Llama al método agregar del carrito
      carrito.agregar(producto);
      // Toastify
      Toastify({
        text: `Se ha añadido ${producto.nombre} al carrito`,
        gravity: "bottom",
        position: "center",
        style: {
          background: "linear-gradient(to right, #d15280, #244ced)",
        },
      }).showToast();
    });
  }
}

// Obtén una referencia al botón de compra por su ID
const botonComprar = document.getElementById("comprarBtn");

// Agrega un event listener al botón de compra
botonComprar.addEventListener("click", function () {
  realizarCompra();
});

// Función para realizar la compra
function realizarCompra() {
  // Simula una acción de compra (puedes agregar aquí la lógica real de compra)
  // En este ejemplo, simplemente se limpia el carrito
  carrito.carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito.carrito));
  carrito.listar();

  // Muestra un mensaje de compra realizada con SweetAlert
  Swal.fire({
    icon: "success",
    title: "Compra realizada con éxito",
    text: "¡Gracias por tu compra!",
  });
}

// Buscador
inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const productos = bd.registrosPorNombre(palabra);
  cargarProductos(productos);
});

// Toggle para ocultar/mostrar el carrito
botonCarrito.addEventListener("click", (event) => {
  document.querySelector("section").classList.toggle("ocultar");
});

botonCerrarCarrito.addEventListener("click", (event) => {
  document.querySelector("section").classList.toggle("ocultar");
});
