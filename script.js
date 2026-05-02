let productos = [];
let carrito = [];

// CARGAR PRODUCTOS
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data.sort((a, b) => {
      if (a.oferta === "si") return -1;
      if (b.oferta === "si") return 1;
      return 0;
    });

    mostrarProductos(productos);
  });

// MOSTRAR PRODUCTOS
function mostrarProductos(lista) {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  lista.forEach((p, index) => {

    const etiquetaOferta = p.oferta === "si"
      ? `<span class="badge">OFERTA</span>`
      : "";

    contenedor.innerHTML += `
      <div class="card">
        ${etiquetaOferta}
        <img src="${p.imagen}">
        <h3>${p.nombre}</h3>
        <p class="precio">$${p.precio}</p>
        <p class="info">${p.piel} | ${p.problema}</p>

        <button onclick="agregarAlCarrito(${index})">
          Agregar
        </button>
      </div>
    `;
  });
}

// AGREGAR AL CARRITO
function agregarAlCarrito(index) {
  const producto = productos[index];
  carrito.push(producto);
  mostrarToast(producto.nombre + " agregado");

  actualizarContador();
}

// TOAST BONITO
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// FILTROS
document.getElementById('filtroCategoria').addEventListener('change', filtrar);
document.getElementById('filtroPiel').addEventListener('change', filtrar);
document.getElementById('filtroProblema').addEventListener('change', filtrar);
document.getElementById('filtroOferta').addEventListener('change', filtrar);

function filtrar() {
  const cat = document.getElementById('filtroCategoria').value;
  const piel = document.getElementById('filtroPiel').value;
  const problema = document.getElementById('filtroProblema').value;
  const oferta = document.getElementById('filtroOferta').value;

  const filtrados = productos.filter(p => {
    return (!cat || p.categoria === cat) &&
           (!piel || p.piel === piel) &&
           (!problema || p.problema === problema) &&
           (!oferta || p.oferta === oferta);
  });

  mostrarProductos(filtrados);
}

// ABRIR CARRITO
document.addEventListener("DOMContentLoaded", function () {

  // BOTÓN CARRITO
  const btnCarrito = document.getElementById("btnCarrito");
  if (btnCarrito) {
    btnCarrito.addEventListener("click", () => {
      abrirCarrito();
    });
  }

  // BOTÓN WHATSAPP CONSULTA
  const btnWhatsApp = document.getElementById("btnWhatsApp");
  if (btnWhatsApp) {
    btnWhatsApp.addEventListener("click", function (e) {
      e.preventDefault();
      enviarConsulta();
    });
  }

});

// MOSTRAR MODAL CARRITO
function abrirCarrito() {
  const modal = document.getElementById("modalCarrito");
  const lista = document.getElementById("listaCarrito");

  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío</p>";
  } else {
    let total = 0;

    carrito.forEach((p, index) => {
      total += p.precio;

      lista.innerHTML += `
        <div class="item-carrito">
          <span>${p.nombre} - $${p.precio}</span>
          <button onclick="eliminarDelCarrito(${index})">❌</button>
        </div>
      `;
    });

    lista.innerHTML += `<h3>Total: $${total}</h3>`;
  }

  modal.style.display = "block";
}

// ENVIAR PEDIDO (CARRITO)
function enviarWhatsApp() {
  if (carrito.length === 0) {
    mostrarToast("Carrito vacío");
    return;
  }

  const numero = "5214462399389";

  let mensaje = "Hola, quiero estos productos:\n";

  carrito.forEach(p => {
    mensaje += `- ${p.nombre} ($${p.precio})\n`;
  });

  const total = carrito.reduce((sum, p) => sum + p.precio, 0);
  mensaje += `\nTotal: $${total}`;

  const url = "https://api.whatsapp.com/send?phone=" 
              + numero 
              + "&text=" 
              + encodeURIComponent(mensaje);

  window.location.href = url;
}

// WHATSAPP SOLO CONSULTA
function enviarConsulta() {
  const numero = "5214462399389";

  const mensaje = "Hola, tengo una consulta sobre productos";

  const url = "https://api.whatsapp.com/send?phone=" 
              + numero 
              + "&text=" 
              + encodeURIComponent(mensaje);

  window.location.href = url;
}

document.addEventListener("DOMContentLoaded", function () {

  const cerrar = document.getElementById("cerrarCarrito");
  const modal = document.getElementById("modalCarrito");

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

});

window.addEventListener("click", function (e) {
  const modal = document.getElementById("modalCarrito");

  if (e.target === modal) {
    modal.style.display = "none";
  }
});

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarContador();
  abrirCarrito();
}

function actualizarContador() {
  const contador = document.getElementById("contadorCarrito");
  contador.textContent = carrito.length;
}