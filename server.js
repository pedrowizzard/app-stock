const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Conexión a SQLite
const db = new sqlite3.Database("./stock.db", (err) => {
  if (err) console.error("Error abriendo BD", err.message);
  else {
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto TEXT,
      tipo TEXT,
      cantidad INTEGER
    )`);
  }
});

// Rutas API
app.get("/productos", (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) res.status(400).json({ error: err.message });
    else res.json(rows);
  });
});

app.post("/productos", (req, res) => {
  const { producto, tipo, cantidad } = req.body;
  db.run("INSERT INTO productos (producto, tipo, cantidad) VALUES (?, ?, ?)", 
    [producto, tipo, cantidad], function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ id: this.lastID, producto, tipo, cantidad });
  });
});

app.delete("/productos/:id", (req, res) => {
  db.run("DELETE FROM productos WHERE id = ?", req.params.id, function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ deletedID: req.params.id });
  });
});

app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
