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

// Создаём папку database
if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

// Подключаемся к БД (файл создастся сам)
const db = new Database('./database/clayart.db');

// СОЗДАЁМ ТАБЛИЦУ ДЛЯ ЗАКАЗОВ (гарантированно)
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

console.log('✅ База данных и таблица orders готовы');

// Проверим, что таблица создалась
const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get();
console.log('📋 Таблица orders существует:', !!tableCheck);

// ========== API ДЛЯ ЗАКАЗОВ ==========

// Сохранение заказа
app.post('/api/order', (req, res) => {
    const { customer, phone, address, items, total } = req.body;
    
    try {
        const stmt = db.prepare(`
            INSERT INTO orders (customer, phone, address, items, total) 
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(customer, phone, address, JSON.stringify(items), total);
        console.log(`✅ Заказ №${result.lastInsertRowid} сохранён`);
        res.json({ success: true, orderId: result.lastInsertRowid });
    } catch (error) {
        console.error('❌ Ошибка сохранения заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение всех заказов
app.get('/api/orders', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
        console.log(`📦 Отправлено ${rows.length} заказов`);
        res.json(rows);
    } catch (error) {
        console.error('❌ Ошибка загрузки заказов:', error);
        res.status(500).json({ error: 'Ошибка загрузки заказов' });
    }
});

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
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});