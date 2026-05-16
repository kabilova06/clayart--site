const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

if (!fs.existsSync('./database')) fs.mkdirSync('./database');

// При первом запуске удаляем старую БД и создаём новую
if (fs.existsSync('./database/clayart.db')) {
    fs.unlinkSync('./database/clayart.db');
    console.log('🗑️ Старая база удалена');
}

const db = new Database('./database/clayart.db');

db.exec(`
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);
console.log('✅ Таблица orders создана');

// ========== API ==========
app.post('/api/order', (req, res) => {
    const { customer, phone, address, items, total } = req.body;
    const itemsStr = Array.isArray(items) ? JSON.stringify(items) : items;
    const stmt = db.prepare(`INSERT INTO orders (customer, phone, address, items, total) VALUES (?, ?, ?, ?, ?)`);
    const result = stmt.run(customer, phone, address, itemsStr, total);
    console.log(`✅ Заказ №${result.lastInsertRowid} сохранён`);
    res.json({ success: true, orderId: result.lastInsertRowid });
});

app.get('/api/orders', (req, res) => {
    const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    console.log(`📦 Отправлено ${rows.length} заказов`);
    res.json(rows);
});

app.get('/api/test', (req, res) => res.json({ status: 'ok', message: 'Сервер работает' }));

// ========== ОТДАЁМ HTML ==========
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/catalog.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'catalog.html')));
app.get('/about.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/gallery.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'gallery.html')));
app.get('/reviews.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reviews.html')));
app.get('/contacts.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contacts.html')));
app.get('/faq.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'faq.html')));
app.get('/cart.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен: http://localhost:${PORT}`));