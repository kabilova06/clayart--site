const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');  // ← ДОБАВИТЬ ЭТУ СТРОКУ

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Создаём папку database, если её нет
if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

const db = new Database('./database/clayart.db');

// Создаём таблицу
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer TEXT,
        phone TEXT,
        address TEXT,
        items TEXT,
        total INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);
console.log('✅ База данных готова');

// API для заказов
app.post('/api/order', (req, res) => {
    const { customer, phone, address, items, total } = req.body;
    
    const stmt = db.prepare(`
        INSERT INTO orders (customer, phone, address, items, total) 
        VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(customer, phone, address, JSON.stringify(items), total);
    res.json({ success: true, orderId: result.lastInsertRowid });
});

app.get('/api/orders', (req, res) => {
    const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    res.json(rows);
});

// ===== ОТДАЁМ HTML СТРАНИЦЫ =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/catalog.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalog.html'));
});
app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/gallery.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});
app.get('/reviews.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reviews.html'));
});
app.get('/contacts.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contacts.html'));
});
app.get('/faq.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});
app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});