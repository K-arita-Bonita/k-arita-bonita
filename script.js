let pedidoAbierto = false; // 🔴 cambia a true cuando abras pedido
let fechaCierreManual = "domingo 15 de junio"; // solo si está abierto
let productos = [];
let carrito = [];

// CARGAR PRODUCTOS
const url =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_3KXLcfc_Y_-ZX9fbtthxQF2FykLW8Hqax8Ws1OXAFqTsZOe1qZHVSDBqXJLp6F_anDNRgiczdx9m/pub?gid=982133858&single=true&output=csv";

Papa.parse(url, {

  download: true,
  header: true,

  complete: function(results) {

    productos = results.data.map(p => ({

      ...p,

      categoria: p.categoria
        ? p.categoria.trim().toLowerCase()
        : "",

      marca: p.marca
        ? p.marca.trim().toLowerCase()
        : "",

      piel: p.piel
        ? p.piel.split(",").map(x => x.trim())
        : [],

      problema: p.problema
        ? p.problema.split(",").map(x => x.trim())
        : []

    }));

    productos = productos.sort((a, b) => {

      if (a.oferta === "si") return -1;
      if (b.oferta === "si") return 1;

      return 0;

    });

    mostrarProductos(productos);
    mostrarTopProductos();

  }

});

// MOSTRAR PRODUCTOS
function mostrarProductos(lista) {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  lista.forEach((p, index) => {

const tieneOferta =
  p.oferta === "si" ||
  (p.tamaños &&
    p.tamaños.some(t => t.oferta === "si"));

const agotado =
  p.stock === "agotado" ||
  (p.tamaños &&
    p.tamaños.every(t => t.stock === "agotado"));

let etiquetaOferta = "";
let etiquetaStock = "";

if (p.tamaños) {

  const primera = p.tamaños[0];

  if (primera.oferta === "si") {
    etiquetaOferta = `<span class="badge">OFERTA</span>`;
  }

  if (primera.stock === "agotado") {
    etiquetaStock = `<span class="badge stock-agotado">⏳ Agotado</span>`;
  }

} else {

  if (p.oferta === "si") {
    etiquetaOferta = `<span class="badge">OFERTA</span>`;
  }

  if (p.stock === "agotado") {
    etiquetaStock = `<span class="badge stock-agotado">⏳ Agotado</span>`;
  }

}

  
let etiquetas = [];

if (p.problema.includes("Acné")) etiquetas.push("💚 Acné");
if (p.problema.includes("Hidratación")) etiquetas.push("💧 Hidratación");
if (p.problema.includes("Manchas/Tono uniforme")) etiquetas.push("✨ Manchas");
if (p.problema.includes("Poros dilatados")) etiquetas.push("🔍 Poros");

if (p.problema.includes("Irritación")) etiquetas.push("🌿 Calma");
if (p.problema.includes("Reparación")) etiquetas.push("🛠️ Reparación");
if (p.problema.includes("Anti-edad")) etiquetas.push("⏳ Anti-edad");
if (p.problema.includes("Firmeza")) etiquetas.push("💪 Firmeza");
if (p.problema.includes("Líneas finas")) etiquetas.push("📉 Líneas");
if (p.problema.includes("Ojeras")) etiquetas.push("👁️ Ojeras");
if (p.problema.includes("Textura")) etiquetas.push("🧪 Textura");
if (p.problema.includes("Limpieza profunda")) etiquetas.push("🧼 Limpieza");

let etiquetaExtra = etiquetas.map(e => `<span class="tag">${e}</span>`).join(" ");

    contenedor.innerHTML += `
      <div class="card">
        <div class="badges-dinamicos">
  ${etiquetaOferta}
  ${etiquetaStock}
</div>

        <img src="${p.imagen}">
       <h3>${p.nombre}</h3>
       <p class="info"><strong>${p.marca}</strong></p>
<p class="precio">
  ${
    p.tamaños
      ? `
        <span class="precio-dinamico">
          $${p.tamaños[0].precio}
        </span>
      `
      : `
        ${p.oferta === "si" && p.precioAnterior
          ? `<span class="precio-anterior">$${p.precioAnterior}</span>`
          : ""}
        <span class="precio-dinamico">
          $${p.precio}
        </span>
      `
  }
</p>
${p.tamaños ? `
<select
  id="tamano-${productos.indexOf(p)}"
  class="selector-tamano"
  onchange="actualizarPrecio(this, ${productos.indexOf(p)})">

  ${p.tamaños.map((t, i) => `
    <option value="${i}">
      ${t.nombre} - $${t.precio}
    </option>
  `).join("")}

</select>
` : ""}

       <p class="info">
        ${p.piel.join(", ")} | ${p.problema.join(", ")}
        </p>
        ${
  !p.tamaños
    ? `<p class="info"><strong>${p.cantidad}</strong></p>`
    : ""
}
        <p class="mensaje">${generarMensaje(p)}</p>
       <div>${etiquetaExtra}</div>
<div class="botones-card">

${
  p.stock === "agotado"
  ? `
    <button class="btn-agotado">
      ⏳ Agotado
    </button>
  `
  : `
    <button onclick="agregarAlCarrito(${productos.indexOf(p)})">
      🛒
    </button>

    <button onclick="pedirProducto(${productos.indexOf(p)})">
      💬 Pedir
    </button>
  `
}

<button onclick="verDetalle(${productos.indexOf(p)})">
  Ver más
</button>

</div>
      </div>
    `;
    if (p.tamaños) {

  setTimeout(() => {

    const select = document.getElementById(`tamano-${productos.indexOf(p)}`);

    if (!select) return;

    // 🔥 si está activo el filtro de ofertas
    const filtroOferta =
      document.getElementById("filtroOferta").value;

    if (filtroOferta === "si") {

      // buscar tamaño en oferta
      const indexOferta = p.tamaños.findIndex(
        t => t.oferta === "si"
      );

      // cambiar automáticamente
      if (indexOferta !== -1) {
        select.value = indexOferta;
      }

    }

    actualizarPrecio(select, productos.indexOf(p));

  }, 0);

}
  });
}

// AGREGAR AL CARRITO
function agregarAlCarrito(index) {

  const producto = productos[index];

  let productoFinal = { ...producto };

  // 🔥 si tiene tamaños
  if (producto.tamaños) {

    const select = document.getElementById(`tamano-${index}`);

    const opcion = producto.tamaños[select.value];

    productoFinal.tamañoSeleccionado = opcion.nombre;
    productoFinal.precioSeleccionado = opcion.precio;

    if (opcion.oferta === "si") {
      productoFinal.precioAnteriorSeleccionado = opcion.precioAnterior;
    }

  } else {

    productoFinal.tamañoSeleccionado = producto.cantidad;
    productoFinal.precioSeleccionado = producto.precio;

  }

  carrito.push(productoFinal);

  mostrarToast(
    producto.nombre +
    " " +
    (productoFinal.tamañoSeleccionado || "")
    + " agregado"
  );

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

const cat = document
  .getElementById('filtroCategoria')
  .value
  .toLowerCase();
  const piel = document.getElementById('filtroPiel').value;
  const problema = document.getElementById('filtroProblema').value;
  const oferta = document.getElementById('filtroOferta').value;
const marca = document
  .getElementById('filtroMarca')
  .value
  .toLowerCase();
  
  const texto = document
    .getElementById("busqueda")
    .value
    .toLowerCase();

  const filtrados = productos.filter(p => {

    const matchCategoria =
      !cat || p.categoria === cat;

    const matchOferta =
  !oferta ||

  p.oferta === oferta ||

  (
    p.tamaños &&
    p.tamaños.some(t => t.oferta === oferta)
  );

    const matchPiel =
      !piel ||
      p.piel.includes(piel) ||
      p.piel.includes("Todo tipo de piel");

    const matchProblema =
      !problema || p.problema.includes(problema);

    const matchMarca =
      !marca || p.marca === marca;

    const matchBusqueda =
      !texto ||
      p.nombre.toLowerCase().includes(texto) ||
      p.marca.toLowerCase().includes(texto);

    return matchCategoria &&
           matchPiel &&
           matchProblema &&
           matchOferta &&
           matchMarca &&
           matchBusqueda;
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
  document.getElementById('filtroMarca').value = "";
  document.getElementById('busqueda').value = "";
  
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

const top = lista
  .filter(p => p.top === "si")
  .slice(0, 3);
  
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

  const piel = document.getElementById('filtroPiel').value;
  const problema = document.getElementById('filtroProblema').value;

  if (lista.length === productos.length) {
    contenedor.innerHTML = "";
    return;
  }

  function elegirProducto(categoria) {

    // 1️⃣ piel + problema
    let prod = lista.find(p =>
      p.categoria === categoria &&
      (!piel || p.piel.includes(piel)) &&
      (!problema || p.problema.includes(problema))
    );
    if (prod) return prod;

    // 2️⃣ solo piel
    prod = lista.find(p =>
      p.categoria === categoria &&
      (!piel || p.piel.includes(piel))
    );
    if (prod) return prod;

    // 3️⃣ solo problema
    prod = lista.find(p =>
      p.categoria === categoria &&
      (!problema || p.problema.includes(problema))
    );
    if (prod) return prod;

    // 4️⃣ top
    prod = lista.find(p =>
      p.categoria === categoria &&
      p.top === "si"
    );
    if (prod) return prod;

    // 5️⃣ cualquiera
    return lista.find(p => p.categoria === categoria);
  }

  const rutina = {
    cleanser: elegirProducto("cleanser"),
    toner: elegirProducto("toner"),
    serum: elegirProducto("sérum") || elegirProducto("serum"),
    cream: elegirProducto("cream"),
    sunscreen: elegirProducto("sunscreen"),
    mask: elegirProducto("mask") // 👈 opcional
  };

  // 🔥 VALIDACIÓN mínima (sin esto no hay rutina útil)
  if (!rutina.cleanser || !rutina.toner || !rutina.serum) {
    contenedor.innerHTML = "";
    return;
  }

  // 🧠 lógica para mostrar mascarilla SOLO si tiene sentido
  let usarMascarilla = false;

  if (
    problema === "Acné" ||
    problema === "Manchas" ||
    problema === "Irritación" ||
    problema === "Hidratación"
  ) {
    usarMascarilla = true;
  }

  contenedor.innerHTML = `
    <h2>🧴 Rutina recomendada</h2>

<div class="rutina-box">

  <div class="rutina-item">
    <img src="${rutina.cleanser?.imagen}" />
    <span>🧼 ${rutina.cleanser?.nombre || "-"}</span>
  </div>

  <div class="rutina-item">
    <img src="${rutina.toner?.imagen}" />
    <span>💧 ${rutina.toner?.nombre || "-"}</span>
  </div>

  <div class="rutina-item">
    <img src="${rutina.serum?.imagen}" />
    <span>✨ ${rutina.serum?.nombre || "-"}</span>
  </div>

  <div class="rutina-item">
    <img src="${rutina.cream?.imagen}" />
    <span>🧴 ${rutina.cream?.nombre || "-"}</span>
  </div>

  <div class="rutina-item">
    <img src="${rutina.sunscreen?.imagen}" />
    <span>☀️ ${rutina.sunscreen?.nombre || "-"}</span>
  </div>

  ${
    usarMascarilla && rutina.mask
      ? `
      <div class="rutina-item">
        <img src="${rutina.mask.imagen}" />
        <span>🧖 ${rutina.mask.nombre}</span>
      </div>
      `
      : ""
  }

</div>

    <button onclick="agregarRutinaFiltrada()">
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
      total += p.precioSeleccionado || p.precio;
      lista.innerHTML += `
        <div>
        ${p.nombre}
${p.tamañoSeleccionado ? `(${p.tamañoSeleccionado})` : ""}
- $${p.precioSeleccionado || p.precio}
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
   mensaje += `- ${p.nombre} ${  p.tamañoSeleccionado  ? "(" + p.tamañoSeleccionado + ")"   : ""
} ($${p.precioSeleccionado || p.precio})\n`;
});

  const total = carrito.reduce(  (sum, p) => sum + (p.precioSeleccionado || p.precio),  0);
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

  const mensaje = "Hola 💖 vengo de K-arita Bonita y tengo una pregunta";

  const url = "https://api.whatsapp.com/send?phone=" 
              + numero 
              + "&text=" 
              + encodeURIComponent(mensaje);

  window.location.href = url;
}

function agregarRutinaFiltrada() {

  const piel = document.getElementById('filtroPiel').value;
  const problema = document.getElementById('filtroProblema').value;

  function elegirProducto(categoria) {
    return productos.find(p =>
      p.categoria === categoria &&
      (!piel || p.piel.includes(piel)) &&
      (!problema || p.problema.includes(problema))
    )
    || productos.find(p => p.categoria === categoria);
  }

  const rutina = [
    elegirProducto("cleanser"),
    elegirProducto("toner"),
    elegirProducto("sérum") || elegirProducto("serum"),
    elegirProducto("cream"),
    elegirProducto("sunscreen")
  ];

  // mascarilla opcional
  if (
    problema === "Acné" ||
    problema === "Manchas/Tono uniforme" ||
    problema === "Irritación" ||
    problema === "Hidratación"
  ) {
    const mask = elegirProducto("mask");
    if (mask) rutina.push(mask);
  }

  rutina.forEach(p => {
    if (p) carrito.push(p);
  });

  actualizarContador();
  mostrarToast("Rutina completa agregada 💖");
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

  let tamaño = p.cantidad;
  let precio = p.precio;

  // 🔥 si tiene tamaños
  if (p.tamaños) {

    const select = document.getElementById(`tamano-${index}`);

    const opcion = p.tamaños[select.value];

    tamaño = opcion.nombre;
    precio = opcion.precio;
  }

  const numero = "5214462399389";

  let mensaje = "Hola 💖 me interesa este producto:\n\n";

  mensaje += `🧴 ${p.nombre}\n`;

  if (tamaño) {
    mensaje += `📦 Tamaño: ${tamaño}\n`;
  }

  mensaje += `💲 $${precio}\n\n`;

  mensaje += "¿Me confirmas disponibilidad y tiempo de entrega? ✨";

  const url =
    "https://api.whatsapp.com/send?phone="
    + numero
    + "&text="
    + encodeURIComponent(mensaje);

  window.location.href = url;
}

function generarMensaje(p) {

  // 🔥 tomar el primer problema del array
  const problema = p.problema[0];

  if (problema === "Acné") {
    return "💚 Reduce brotes y controla grasa";
  }

  if (problema === "Manchas/Tono uniforme") {
    return "✨ Unifica el tono y aporta glow";
  }

  if (problema === "Hidratación") {
    return "💧 Hidratación profunda sin pesadez";
  }

  if (problema === "Poros dilatados") {
    return "🔍 Minimiza la apariencia de poros";
  }

  if (problema === "Irritación") {
    return "🌿 Calma y reduce enrojecimiento";
  }

  if (problema === "Reparación") {
    return "🛠️ Repara la barrera de la piel";
  }

  if (problema === "Anti-edad") {
    return "⏳ Mejora signos de la edad";
  }

  if (problema === "Firmeza") {
    return "💪 Mejora elasticidad y firmeza";
  }

  if (problema === "Líneas finas") {
    return "📉 Suaviza líneas finas";
  }

  if (problema === "Ojeras") {
    return "👁️ Ilumina y reduce ojeras";
  }

  if (problema === "Textura") {
    return "🧪 Mejora la textura de la piel";
  }

  if (problema === "Limpieza profunda") {
    return "🧼 Limpieza profunda de poros";
  }

  return "🌿 Ideal para tu rutina";
}

function actualizarPrecio(select, index) {

  const producto = productos[index];

  const opcion = producto.tamaños[select.value];

  const card = select.closest(".card");

  // PRECIO
  const precioHTML = `
    ${
      opcion.oferta === "si" && opcion.precioAnterior
        ? `<span class="precio-anterior">$${opcion.precioAnterior}</span>`
        : ""
    }

    <span class="precio-dinamico">
      $${opcion.precio}
    </span>
  `;

  card.querySelector(".precio").innerHTML = precioHTML;

  // BADGES
  let badgesHTML = "";

  if (opcion.oferta === "si") {
    badgesHTML += `<span class="badge">OFERTA</span>`;
  }

  if (opcion.stock === "agotado") {
    badgesHTML += `
      <span class="badge stock-agotado">
        ⏳ Temporalmente Agotado
      </span>
    `;
  }

  card.querySelector(".badges-dinamicos").innerHTML = badgesHTML;

  // BOTONES
  const botones = card.querySelector(".botones-card");

  if (opcion.stock === "agotado") {

    botones.innerHTML = `
      <button class="btn-agotado">
        ⏳ Agotado
      </button>

      <button onclick="verDetalle(${index})">
        Ver más
      </button>
    `;

  } else {

    botones.innerHTML = `
      <button onclick="agregarAlCarrito(${index})">
        🛒
      </button>

      <button onclick="pedirProducto(${index})">
        💬 Pedir
      </button>

      <button onclick="verDetalle(${index})">
        Ver más
      </button>
    `;
  }
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
    <p>${p.uso && p.uso !== "0" ? p.uso : "Aplicar según rutina básica"}</p>

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

document.getElementById('filtroMarca').addEventListener('change', filtrar);

function buscarProductos() {
  filtrar();
}

function limpiarBusqueda() {

  document.getElementById("busqueda").value = "";

  filtrar();
}

