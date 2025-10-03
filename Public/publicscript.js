const form = document.getElementById("productoForm");
const tablaBody = document.querySelector("#tablaProductos tbody");

async function cargarProductos() {
  const res = await fetch("/api/productos");
  const data = await res.json();
  renderProductos(data);
}

function renderProductos(productos) {
  tablaBody.innerHTML = "";
  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.tipo}</td>
      <td>${p.cantidad}</td>
      <td>
        <button onclick="editarProducto(${p.id}, '${p.nombre}', '${p.tipo}', ${p.cantidad})">✏️</button>
        <button onclick="eliminarProducto(${p.id})">❌</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevo = {
    nombre: document.getElementById("nombre").value,
    tipo: document.getElementById("tipo").value,
    cantidad: parseInt(document.getElementById("cantidad").value)
  };

  await fetch("/api/productos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo)
  });

  form.reset();
  cargarProductos();
});

async function eliminarProducto(id) {
  await fetch(`/api/productos/${id}`, { method: "DELETE" });
  cargarProductos();
}

async function editarProducto(id, nombreActual, tipoActual, cantidadActual) {
  const nuevoNombre = prompt("Nuevo nombre del producto:", nombreActual);
  const nuevoTipo = prompt("Nuevo tipo del producto:", tipoActual);
  const nuevaCantidad = prompt("Nueva cantidad:", cantidadActual);

  if (nuevoNombre && nuevoTipo && nuevaCantidad !== null && !isNaN(nuevaCantidad)) {
    await fetch(`/api/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevoNombre,
        tipo: nuevoTipo,
        cantidad: parseInt(nuevaCantidad)
      })
    });
    cargarProductos();
  }
}

cargarProductos();
