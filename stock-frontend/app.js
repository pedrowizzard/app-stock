// app.js — CRUD en LocalStorage
const STORAGE_KEY = 'stock_app_items_v1';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { console.error('Error leyendo LocalStorage', e); return []; }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createRow(item) {
  const tpl = document.getElementById('row-template');
  const tr = tpl.content.firstElementChild.cloneNode(true);
  tr.dataset.id = item.id;
  tr.querySelector('.c-producto').textContent = item.producto;
  tr.querySelector('.c-tipo').textContent = item.tipo;
  tr.querySelector('.c-cantidad').textContent = item.cantidad;
  return tr;
}

function render(filterText=''){
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '';
  const items = loadItems();
  const filtered = items.filter(i => {
    const q = filterText.trim().toLowerCase();
    if(!q) return true;
    return i.producto.toLowerCase().includes(q) || i.tipo.toLowerCase().includes(q);
  });
  if(filtered.length === 0){
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4"><small>No hay productos</small></td>';
    tbody.appendChild(tr);
    return;
  }
  filtered.forEach(i => tbody.appendChild(createRow(i)));
}

function addItem(producto, tipo, cantidad){
  const items = loadItems();
  const newItem = { id: uid(), producto, tipo, cantidad: Number(cantidad) };
  items.unshift(newItem);
  saveItems(items);
  render(document.getElementById('search').value);
}

function updateItem(id, producto, tipo, cantidad){
  const items = loadItems();
  const idx = items.findIndex(x => x.id === id);
  if(idx === -1) return false;
  items[idx] = { ...items[idx], producto, tipo, cantidad: Number(cantidad) };
  saveItems(items);
  render(document.getElementById('search').value);
  return true;
}

function deleteItem(id){
  let items = loadItems();
  items = items.filter(x => x.id !== id);
  saveItems(items);
  render(document.getElementById('search').value);
}

// Eventos UI
document.getElementById('addBtn').addEventListener('click', () => {
  const producto = document.getElementById('producto').value.trim();
  const tipo = document.getElementById('tipo').value.trim();
  const cantidad = document.getElementById('cantidad').value;
  if(!producto || !tipo || cantidad === '') return alert('Completa todos los campos');
  if(Number(cantidad) < 0) return alert('Cantidad inválida');
  addItem(producto, tipo, Number(cantidad));
  document.getElementById('producto').value = '';
  document.getElementById('tipo').value = '';
  document.getElementById('cantidad').value = '';
});

// Eventos de la tabla (editar y borrar)
document.querySelector('#table tbody').addEventListener('click', (e) => {
  const btn = e.target.closest('button'); // nos aseguramos que sea un botón
  if (!btn) return;

  const tr = btn.closest('tr');
  if (!tr || !tr.dataset.id) return;
  const id = tr.dataset.id;

  if (btn.matches('.del')) {
    if (!confirm('¿Borrar producto?')) return;
    deleteItem(id);
  } else if (btn.matches('.edit')) {
    const items = loadItems();
    const item = items.find(x => x.id === id);
    if (!item) return alert('Item no encontrado');

    const producto = prompt('Producto', item.producto);
    if (producto == null) return;
    const tipo = prompt('Tipo', item.tipo);
    if (tipo == null) return;
    const cantidadStr = prompt('Cantidad', String(item.cantidad));
    if (cantidadStr == null) return;
    const cantidad = Number(cantidadStr);
    if (isNaN(cantidad) || cantidad < 0) return alert('Cantidad inválida');

    updateItem(id, producto.trim(), tipo.trim(), cantidad);
  }
});


// Buscar en tiempo real
document.getElementById('search').addEventListener('input', (e) => render(e.target.value));

// Exportar JSON
document.getElementById('exportBtn').addEventListener('click', () => {
  const items = loadItems();
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'stock_export.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// Importar JSON
const importFile = document.getElementById('importFile');
document.getElementById('importBtn').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const data = JSON.parse(ev.target.result);
      if(!Array.isArray(data)) throw new Error('Formato inválido');
      const normalized = data.map(d => ({ id: d.id || uid(), producto: String(d.producto||'').trim(), tipo: String(d.tipo||'').trim(), cantidad: Number(d.cantidad||0) }));
      saveItems(normalized);
      render();
      alert('Importado OK');
    }catch(err){
      alert('Error al importar: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// Borrar todo
document.getElementById('clearBtn').addEventListener('click', () => {
  if(!confirm('Borrar TODO el inventario? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
});

// Inicializar con render
render();