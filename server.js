import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. CẤU HÌNH DATABASE
const dbDir = path.join(__dirname, '.data');
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir);
}

const isGlitch = process.env.PROJECT_DOMAIN; 
const dbPath = isGlitch ? path.join(dbDir, 'dua_database.db') : './dua_database.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Lỗi kết nối database:', err.message);
  else console.log('Đã kết nối cơ sở dữ liệu SQLite thành công.');
});

// 2. TẠO CÁC BẢNG TRONG DATABASE (Số dừa cho phép lưu số thập phân REAL)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS harvest_data (date TEXT PRIMARY KEY, name TEXT, status TEXT, count REAL)`);
  
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT UNIQUE, 
    cycle_days INTEGER DEFAULT 25,
    price REAL DEFAULT 60000
  )`);
});

// 3. CÁC API TRẢ VỀ DỮ LIỆU
app.get('/api/records', (req, res) => {
  const monthPrefix = req.query.month; 
  db.all(`SELECT * FROM harvest_data WHERE date LIKE ?`, [`${monthPrefix}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const recordsObj = {};
    rows.forEach(row => { recordsObj[row.date] = { name: row.name, status: row.status, count: row.count }; });
    res.json(recordsObj);
  });
});

app.post('/api/records', (req, res) => {
  const { date, name, status, count } = req.body;
  const query = `INSERT INTO harvest_data (date, name, status, count) VALUES (?, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET name=excluded.name, status=excluded.status, count=excluded.count`;
  db.run(query, [date, name, status, count], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Lưu thành công!' });
  });
});

app.get('/api/customers', (req, res) => {
  db.all(`SELECT * FROM customers ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, cycle_days, price } = req.body;
  db.run(`INSERT INTO customers (name, cycle_days, price) VALUES (?, ?, ?)`, 
    [name, cycle_days || 25, price || 60000], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, cycle_days, price: price || 60000 });
  });
});

app.put('/api/customers/:id', (req, res) => {
  const { name, cycle_days, price } = req.body;
  db.run(`UPDATE customers SET name = ?, cycle_days = ?, price = ? WHERE id = ?`,
    [name, cycle_days, price, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cập nhật thành công!' });
  });
});

app.delete('/api/customers/:id', (req, res) => {
  db.run(`DELETE FROM customers WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Đã xóa thành công' });
  });
});

// 4. PHỤC VỤ FILE GIAO DIỆN REACT
app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 5. KHỞI CHẠY SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});