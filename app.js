const API_URL = "http://localhost:3000/productos";

const form = document.getElementById("stockForm");
const tabla = document.querySelector("#tablaProductos tbody");

async function cargarProductos() {
  tabla.innerHTML = "";
  const res = await fetch(API_URL);
  const productos = await res.json();
  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.producto}</td>
      <td>${p.tipo}</td>
      <td>${p.cantidad}</td>
      <td><button onclick="eliminarProducto(${p.id})">❌</button></td>
    `;
    tabla.appendChild(fila);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const producto = document.getElementById("producto").value;
  const tipo = document.getElementById("tipo").value;
  const cantidad = document.getElementById("cantidad").value;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ producto, tipo, cantidad })
  });

  form.reset();
  cargarProductos();
});

async function eliminarProducto(id) {
  await fetch(API_URL + "/" + id, { method: "DELETE" });
  cargarProductos();
}

cargarProductos();
