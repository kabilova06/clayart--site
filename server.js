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

if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

const db = new Database('./database/clayart.db');

// Создаём базовые таблицы
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

db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// ========== АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ ТАБЛИЦЫ ==========
try {
    const columns = db.prepare("PRAGMA table_info(products)").all();
    const columnNames = columns.map(c => c.name);
    
    if (!columnNames.includes('category')) {
        db.exec('ALTER TABLE products ADD COLUMN category TEXT');
        console.log('✅ Добавлена колонка category');
    }
    if (!columnNames.includes('description')) {
        db.exec('ALTER TABLE products ADD COLUMN description TEXT');
        console.log('✅ Добавлена колонка description');
    }
    if (!columnNames.includes('image')) {
        db.exec('ALTER TABLE products ADD COLUMN image TEXT');
        console.log('✅ Добавлена колонка image');
    }
    if (!columnNames.includes('color_variants')) {
        db.exec('ALTER TABLE products ADD COLUMN color_variants TEXT DEFAULT "[]"');
        console.log('✅ Добавлена колонка color_variants');
    }
    if (!columnNames.includes('is_summer')) {
        db.exec('ALTER TABLE products ADD COLUMN is_summer INTEGER DEFAULT 0');
        console.log('✅ Добавлена колонка is_summer');
    }
    if (!columnNames.includes('is_bestseller')) {
        db.exec('ALTER TABLE products ADD COLUMN is_bestseller INTEGER DEFAULT 0');
        console.log('✅ Добавлена колонка is_bestseller');
    }
    if (!columnNames.includes('is_new')) {
        db.exec('ALTER TABLE products ADD COLUMN is_new INTEGER DEFAULT 0');
        console.log('✅ Добавлена колонка is_new');
    }
} catch(e) {
    console.log('Ошибка обновления БД:', e.message);
}

console.log('✅ База данных готова');

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
    const products = db.prepare('SELECT * FROM products ORDER BY id').all();
    res.json(products);
});

app.get('/api/admin/products/:id', checkAuth, (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
});

app.post('/api/admin/products', checkAuth, (req, res) => {
    const { name, price, category, description, image, color_variants, is_summer, is_bestseller, is_new } = req.body;
    
    const stmt = db.prepare(`
        INSERT INTO products (name, price, category, description, image, color_variants, is_summer, is_bestseller, is_new)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
        name, 
        price, 
        category || 'mugs', 
        description || '', 
        image || '', 
        JSON.stringify(color_variants || []), 
        is_summer ? 1 : 0, 
        is_bestseller ? 1 : 0, 
        is_new ? 1 : 0
    );
    
    res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/admin/products/:id', checkAuth, (req, res) => {
    const { name, price, category, description, image, color_variants, is_summer, is_bestseller, is_new } = req.body;
    
    const stmt = db.prepare(`
        UPDATE products 
        SET name = ?, price = ?, category = ?, description = ?, 
            image = ?, color_variants = ?, is_summer = ?, is_bestseller = ?, is_new = ?
        WHERE id = ?
    `);
    
    const result = stmt.run(
        name, 
        price, 
        category || 'mugs', 
        description || '', 
        image || '', 
        JSON.stringify(color_variants || []), 
        is_summer ? 1 : 0, 
        is_bestseller ? 1 : 0, 
        is_new ? 1 : 0, 
        req.params.id
    );
    
    if (result.changes === 0) return res.status(404).json({ error: 'Товар не найден' });
    res.json({ success: true });
});

app.delete('/api/admin/products/:id', checkAuth, (req, res) => {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Товар не найден' });
    res.json({ success: true });
});

// ========== ПУБЛИЧНЫЕ API ==========
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY id').all();
    const productsWithColors = products.map(p => ({
        ...p,
        color_variants: JSON.parse(p.color_variants || '[]')
    }));
    res.json(productsWithColors);
});

app.get('/api/products/:id', (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    product.color_variants = JSON.parse(product.color_variants || '[]');
    res.json(product);
});

// ========== API ДЛЯ ЗАКАЗОВ ==========
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