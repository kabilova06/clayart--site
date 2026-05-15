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

const db = new sqlite3.Database('./database/clayart.db');

// Создаём таблицы, если их нет
db.serialize(() => {
    db.run(`
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
    
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            image TEXT,
            color_variants TEXT DEFAULT '[]',
            is_summer INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('✅ База данных готова');
});

// ========== ЗАЩИТА АДМИНКИ ==========
function checkAuth(req, res, next) {
    const token = req.headers['authorization'];
    if (token === 'Bearer clayart_admin_2026') {
        next();
    } else {
        res.status(401).json({ error: 'Не авторизован' });
    }
}

// ========== API ДЛЯ ТОВАРОВ ==========
app.get('/api/admin/products', checkAuth, (req, res) => {
    db.all('SELECT * FROM products ORDER BY id', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/products/:id', checkAuth, (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Товар не найден' });
        res.json(row);
    });
});

app.post('/api/admin/products', checkAuth, (req, res) => {
    const { name, price, category, description, image, color_variants, is_summer } = req.body;
    
    db.run(`
        INSERT INTO products (name, price, category, description, image, color_variants, is_summer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, price, category, description || '', image || '', JSON.stringify(color_variants || []), is_summer ? 1 : 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.put('/api/admin/products/:id', checkAuth, (req, res) => {
    const { name, price, category, description, image, color_variants, is_summer } = req.body;
    
    db.run(`
        UPDATE products 
        SET name = ?, price = ?, category = ?, description = ?, 
            image = ?, color_variants = ?, is_summer = ?
        WHERE id = ?
    `, [name, price, category, description || '', image || '', JSON.stringify(color_variants || []), is_summer ? 1 : 0, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Товар не найден' });
        res.json({ success: true });
    });
});

app.delete('/api/admin/products/:id', checkAuth, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Товар не найден' });
        res.json({ success: true });
    });
});

// ========== ПУБЛИЧНЫЕ API ==========
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY id', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const productsWithColors = rows.map(p => ({
            ...p,
            color_variants: JSON.parse(p.color_variants || '[]')
        }));
        res.json(productsWithColors);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Товар не найден' });
        row.color_variants = JSON.parse(row.color_variants || '[]');
        res.json(row);
    });
});

// ========== API ДЛЯ ЗАКАЗОВ ==========
app.post('/api/order', (req, res) => {
    const { customer, phone, address, items, total } = req.body;
    
    db.run(`
        INSERT INTO orders (customer, phone, address, items, total) 
        VALUES (?, ?, ?, ?, ?)
    `, [customer, phone, address, JSON.stringify(items), total], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, orderId: this.lastID });
    });
});

app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
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
app.get('/admin-orders.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-orders.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-login.html')));
app.get('/admin-products.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-products.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`🔐 Админка: http://localhost:${PORT}/admin (логин: admin, пароль: clayart2026)`);
});