import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Port linh hoạt khi đưa lên mạng
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// CẤU HÌNH DATABASE DÀNH CHO GLITCH
// Quan trọng: Trên Glitch phải lưu file db vào thư mục ẩn .data để không bị mất dữ liệu
const dbDir = path.join(__dirname, '.data');
if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir);
}
// Nhận diện xem đang chạy trên máy tính hay trên Glitch
const isGlitch = process.env.PROJECT_DOMAIN; 
const dbPath = isGlitch ? path.join(dbDir, 'dua_database.db') : './dua_database.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Lỗi kết nối database:', err.message);
  else console.log('Đã kết nối cơ sở dữ liệu SQLite.');
});

// Tạo bảng
db.run(`CREATE TABLE IF NOT EXISTS harvest_data (date TEXT PRIMARY KEY, name TEXT, status TEXT, count INTEGER)`);
db.run(`CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, standard_count INTEGER, cycle_days INTEGER)`);

// ============ CÁC API TƯƠNG TÁC DỮ LIỆU ============
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
  db.all(`SELECT * FROM customers`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, standard_count, cycle_days } = req.body;
  db.run(`INSERT INTO customers (name, standard_count, cycle_days) VALUES (?, ?, ?)`, 
    [name, standard_count, cycle_days], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, standard_count, cycle_days });
  });
});

// ============ PHẦN MỚI: TÍCH HỢP GIAO DIỆN VÀO BACKEND ============
// Cho phép phục vụ các file giao diện tĩnh (css, js, hình ảnh) trong thư mục dist
app.use(express.static(path.join(__dirname, 'dist')));

// Bất kỳ đường dẫn nào người dùng gõ vào, sẽ trả về trang web React
// Bất kỳ đường dẫn nào người dùng gõ vào, sẽ trả về trang web React
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server Máy Chủ ĐÃ GỘP đang chạy tại: http://localhost:${PORT}`);
});