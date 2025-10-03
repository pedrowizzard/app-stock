const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "productos.json");

// 📂 Leer productos
function leerProductos() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
  }
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(data);
}

// 📂 Guardar productos
function guardarProductos(productos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(productos, null, 2));
}

// 📦 Obtener productos
app.get("/api/productos", (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

// 📦 Agregar producto
app.post("/api/productos", (req, res) => {
  const { nombre, tipo, cantidad } = req.body;
  if (!nombre || !tipo || cantidad == null) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const productos = leerProductos();
  const nuevoProducto = { id: Date.now(), nombre, tipo, cantidad };
  productos.push(nuevoProducto);
  guardarProductos(productos);

  res.json(nuevoProducto);
});

// 📦 Eliminar producto
app.delete("/api/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let productos = leerProductos();
  productos = productos.filter(p => p.id !== id);
  guardarProductos(productos);

  res.json({ mensaje: "Producto eliminado" });
});

// 📦 Editar producto (nombre, tipo, cantidad)
app.put("/api/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, tipo, cantidad } = req.body;

  if (!nombre || !tipo || cantidad == null || isNaN(cantidad)) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  let productos = leerProductos();
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  productos[index].nombre = nombre;
  productos[index].tipo = tipo;
  productos[index].cantidad = cantidad;

  guardarProductos(productos);

  res.json(productos[index]);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

