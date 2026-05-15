const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Создаём папку database, если её нет
if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

// Подключаемся к базе данных
const db = new sqlite3.Database('./database/clayart.db');

// Создаём таблицу для заказов
db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT,
    phone TEXT,
    address TEXT,
    items TEXT,
    total INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

console.log('✅ База данных готова');

// ========== API ДЛЯ ЗАКАЗОВ ==========

// Сохранение заказа
app.post('/api/order', (req, res) => {
    const { customer, phone, address, items, total } = req.body;
    
    db.run(`INSERT INTO orders (customer, phone, address, items, total) VALUES (?, ?, ?, ?, ?)`,
        customer, phone, address, JSON.stringify(items), total,
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }
            res.json({ success: true, orderId: this.lastID });
        });
});

// Получение всех заказов
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ========== ОТДАЁМ HTML СТРАНИЦЫ ==========
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
    console.log(`📦 Админ-панель: http://localhost:${PORT}/admin.html`);
});