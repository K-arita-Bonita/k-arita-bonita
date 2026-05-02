let pedidoAbierto = false; // 🔴 cambia a true cuando abras pedido
let fechaCierreManual = "domingo 15 de junio"; // solo si está abierto
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
    mostrarTopProductos();
  });

// MOSTRAR PRODUCTOS
function mostrarProductos(lista) {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  lista.forEach((p, index) => {

    const etiquetaOferta = p.oferta === "si"
      ? `<span class="badge">OFERTA</span>`
      : "";

    let etiquetaExtra = "";

    if (p.problema === "acne") {
      etiquetaExtra = "✨ Ideal para acné";
    } else if (p.problema === "hidratacion") {
      etiquetaExtra = "💧 Hidratación";
    } else if (p.problema === "manchas") {
      etiquetaExtra = "🌟 Manchas";
    }

    contenedor.innerHTML += `
      <div class="card">
        ${etiquetaOferta}
        <img src="${p.imagen}">
        <h3>${p.nombre}</h3>
        <p class="precio">$${p.precio}</p>
        <p class="info">${p.piel} | ${p.problema}</p>
        <p class="mensaje">${generarMensaje(p)}</p>
        <p class="tag">${etiquetaExtra}</p>

<div class="botones-card">
  <button onclick="agregarAlCarrito(${index})">
    🛒
  </button>

  <button onclick="pedirProducto(${index})">
    💬 Pedir
  </button>
  <button onclick="verDetalle(${index})">
  Ver más
</button>
</div>
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

// TOAST
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
  mostrarRecomendados(filtrados);
  mostrarRutina(filtrados);
}

// LIMPIAR FILTROS
function limpiarFiltros() {
  document.getElementById('filtroCategoria').value = "";
  document.getElementById('filtroPiel').value = "";
  document.getElementById('filtroProblema').value = "";
  document.getElementById('filtroOferta').value = "";

  mostrarProductos(productos);
  document.getElementById("recomendados").innerHTML = "";
  document.getElementById("rutina").innerHTML = "";
}

// RECOMENDADOS
function mostrarRecomendados(lista) {
  const contenedor = document.getElementById("recomendados");

  if (!contenedor) return;

  if (lista.length === productos.length || lista.length === 0) {
    contenedor.innerHTML = "";
    return;
  }

  const top = lista.slice(0, 3);

  let html = "<h2>✨ Recomendados para ti</h2>";

  top.forEach(p => {
    html += `
      <div class="reco-item">
        <img src="${p.imagen}">
        <p>${p.nombre}</p>
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

// RUTINA
function mostrarRutina(lista) {
  const contenedor = document.getElementById("rutina");

  if (!contenedor) return;

  if (lista.length === productos.length) {
    contenedor.innerHTML = "";
    return;
  }

  const cleanser = lista.find(p => p.categoria === "cleanser");
  const toner = lista.find(p => p.categoria === "toner");
  const serum = lista.find(p => p.categoria === "serum");

  if (!cleanser || !toner || !serum) {
    contenedor.innerHTML = "";
    return;
  }

  contenedor.innerHTML = `
  <h2>🧴 Rutina recomendada</h2>

  <div class="rutina-box">
    <div>${cleanser.nombre}</div>
    <div>${toner.nombre}</div>
    <div>${serum.nombre}</div>
  </div>

  <button onclick="agregarRutina()">
    Agregar rutina completa 🛒
  </button>
`;
}

// CARRITO
document.addEventListener("DOMContentLoaded", function () {

  const btnCarrito = document.getElementById("btnCarrito");
  if (btnCarrito) {
    btnCarrito.addEventListener("click", () => {
      abrirCarrito();
    });
  }

  const btnWhatsApp = document.getElementById("btnWhatsApp");
  if (btnWhatsApp) {
    btnWhatsApp.addEventListener("click", function (e) {
      e.preventDefault();
      enviarConsulta();
    });
  }

});

// ABRIR CARRITO
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
        <div>
          ${p.nombre} - $${p.precio}
          <button onclick="eliminarDelCarrito(${index})">❌</button>
        </div>
      `;
    });

    lista.innerHTML += `<h3>Total: $${total}</h3>`;
  }

  modal.style.display = "block";
  modal.style.pointerEvents = "auto";
}

// CERRAR CARRITO
document.addEventListener("DOMContentLoaded", function () {
  const cerrar = document.getElementById("cerrarCarrito");
  const modal = document.getElementById("modalCarrito");

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      modal.style.display = "none";
      modal.style.pointerEvents = "none";
    });
  }
});

// CLICK FUERA
window.addEventListener("click", function (e) {
  const modal = document.getElementById("modalCarrito");

  if (e.target === modal) {
    modal.style.display = "none";
    modal.style.pointerEvents = "none";
  }
});

// ELIMINAR
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarContador();
  abrirCarrito();
}

// CONTADOR
function actualizarContador() {
  const contador = document.getElementById("contadorCarrito");
  contador.textContent = carrito.length;
}

// WHATSAPP PEDIDO
function enviarWhatsApp() {
  if (carrito.length === 0) {
    mostrarToast("Carrito vacío");
    return;
  }

  const numero = "5214462399389";

  let mensaje = "Hola 💖 vi estos productos en K-arita Bonita y me interesan:\n";

  carrito.forEach(p => {
    mensaje += `- ${p.nombre} ($${p.precio})\n`;
  });

  const total = carrito.reduce((sum, p) => sum + p.precio, 0);
  mensaje += `\nTotal: $${total}\n\n¿Me ayudas con disponibilidad? 💖`;

  const url = "https://api.whatsapp.com/send?phone=" 
              + numero 
              + "&text=" 
              + encodeURIComponent(mensaje);

  window.location.href = url;
}

// WHATSAPP CONSULTA
function enviarConsulta() {
  const numero = "5214462399389";

  const mensaje = "Hola 💖 vengo de K-arita Bonita y tengo una consulta";

  const url = "https://api.whatsapp.com/send?phone=" 
              + numero 
              + "&text=" 
              + encodeURIComponent(mensaje);

  window.location.href = url;
}

function agregarRutina() {
  const cleanser = productos.find(p => p.categoria === "cleanser");
  const toner = productos.find(p => p.categoria === "toner");
  const serum = productos.find(p => p.categoria === "serum");

  if (cleanser) carrito.push(cleanser);
  if (toner) carrito.push(toner);
  if (serum) carrito.push(serum);

  actualizarContador();
  mostrarToast("Rutina agregada 💖");
}

function mostrarTopProductos() {
  const contenedor = document.getElementById("topProductos");

  if (!contenedor) return;

  // 🔥 solo los que marcaste
const top = productos.filter(p => p.top === "si");

  if (top.length === 0) {
    contenedor.innerHTML = "";
    return;
  }

  let html = "<h2>🔥 Más vendidos</h2>";

  top.forEach(p => {
    html += `
      <div class="reco-item">
        <img src="${p.imagen}">
        <p>${p.nombre}</p>
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

function mostrarInfoPedido() {
  const contenedor = document.getElementById("infoPedido");

  if (!pedidoAbierto) {
    contenedor.innerHTML = `
      <div class="info-box">
        <p>🛍️ Productos importados desde Corea</p>
        <p>⏸️ Actualmente no hay pedido abierto</p>
        <p>💬 Escríbeme por WhatsApp para apartar productos</p>
        <p>📦 Entrega: 20 a 25 días hábiles</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = `
    <div class="info-box">
      <p>🛍️ Productos sobre pedido desde Corea</p>
      <p>⏳ Próximo pedido cierra: <strong>${fechaCierreManual}</strong></p>
      <p>📦 Entrega: 20 a 25 días hábiles</p>
    </div>
  `;
}

   mostrarInfoPedido();
   
   function pedirProducto(index) {
  const p = productos[index];

  const numero = "5214462399389";

  let mensaje = "Hola 💖 me interesa este producto:\n\n";
  mensaje += `🧴 ${p.nombre}\n`;
  mensaje += `💲 $${p.precio}\n\n`;
  mensaje += "¿Me confirmas disponibilidad y tiempo de entrega? ✨";

  const url = "https://api.whatsapp.com/send?phone="
              + numero
              + "&text="
              + encodeURIComponent(mensaje);

  window.location.href = url;
}

function generarMensaje(p) {
  if (p.problema === "acne") {
    return "💚 Ayuda a reducir brotes y controlar grasa";
  }

  if (p.problema === "manchas") {
    return "✨ Ideal para unificar el tono de la piel";
  }

  if (p.problema === "hidratacion") {
    return "💧 Aporta hidratación profunda y glow";
  }

  return "🌿 Recomendado para tu rutina";
}

function verDetalle(index) {
  const p = productos[index];
  const modal = document.getElementById("modalDetalle");
  const contenido = document.getElementById("contenidoDetalle");

  contenido.innerHTML = `
    <h2>${p.nombre}</h2>
    <img src="${p.imagen}" style="width:100%; border-radius:10px;">

    <p><strong>💖 Descripción:</strong></p>
    <p>${p.descripcion}</p>

    <p><strong>🧴 ¿Cómo usarlo?</strong></p>
    <p>${p.uso}</p>

    <button onclick="pedirProducto(${index})">
      💬 Pedir por WhatsApp
    </button>
  `;

  modal.style.display = "block";
  modal.style.pointerEvents = "auto";
}

document.addEventListener("DOMContentLoaded", function () {
  const cerrar = document.getElementById("cerrarDetalle");
  const modal = document.getElementById("modalDetalle");

  if (cerrar) {
    cerrar.addEventListener("click", () => {
      modal.style.display = "none";
      modal.style.pointerEvents = "none";
    });
  }
});
