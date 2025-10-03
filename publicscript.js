const form = document.getElementById("productoForm");
const tablaBody = document.querySelector("#tablaProductos tbody");

async function cargarProductos() {
  try {
    const res = await fetch("/api/productos");
    if (!res.ok) throw new Error("Error al obtener productos");
    const data = await res.json();
    console.log("📥 Productos cargados:", data);
    renderProductos(data);
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
  }
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
    nombre: document.getElementById("nombre").value.trim(),
    tipo: document.getElementById("tipo").value.trim(),
    cantidad: parseInt(document.getElementById("cantidad").value)
  };

  console.log("📝 Enviando producto:", nuevo);

  try {
    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error("Error al guardar producto: " + errorMsg);
    }

    const data = await res.json();
    console.log("✅ Producto guardado en servidor:", data);

    form.reset();
    cargarProductos();
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    alert("Error al guardar producto. Revisa consola.");
  }
});

async function eliminarProducto(id) {
  console.log("🗑 Eliminando producto ID:", id);
  try {
    await fetch(`/api/productos/${id}`, { method: "DELETE" });
    cargarProductos();
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
  }
}

async function editarProducto(id, nombreActual, tipoActual, cantidadActual) {
  console.log("✏️ Editando producto:", { id, nombreActual, tipoActual, cantidadActual });

  const nuevoNombre = prompt("Nuevo nombre del producto:", nombreActual);
  const nuevoTipo = prompt("Nuevo tipo del producto:", tipoActual);
  const nuevaCantidad = prompt("Nueva cantidad:", cantidadActual);

  if (nuevoNombre && nuevoTipo && nuevaCantidad !== null && !isNaN(nuevaCantidad)) {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre,
          tipo: nuevoTipo,
          cantidad: parseInt(nuevaCantidad)
        })
      });

      if (!res.ok) throw new Error("Error al editar producto");

      const data = await res.json();
      console.log("✅ Producto editado:", data);
      cargarProductos();
    } catch (error) {
      console.er
