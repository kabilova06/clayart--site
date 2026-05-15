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

// Создаём таблицы
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
        category TEXT NOT NULL,
        description TEXT,
        image TEXT,
        color_variants TEXT DEFAULT '[]',
        is_summer INTEGER DEFAULT 0,
        is_bestseller INTEGER DEFAULT 0,
        is_new INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// ========== АВТОМАТИЧЕСКОЕ ДОБАВЛЕНИЕ ТОВАРОВ ==========
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
    console.log('📦 База данных пустая. Добавляем 25 товаров...');
    
    const insert = db.prepare(`
        INSERT INTO products (name, price, category, description, image, color_variants, is_summer, is_bestseller, is_new)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // КРУЖКИ
    insert.run('Кружка «Гармония»', 1200, 'mugs', 'Тёплая кружка ручной работы для уютных моментов. Приятный матовый оттенок и удобная форма — идеальна для чая или кофе.', '/images/cup-beige.jpg', JSON.stringify(['/images/cup-beige.jpg', '/images/cup-white.jpg']), 0, 1, 0);
    insert.run('Кружка «Тюльпан»', 1900, 'summer', 'Нежная керамическая кружка с наивным цветочным рисунком. Привносит уют и весеннее настроение в любое утро.', '/images/sumcup1.jpg', '[]', 1, 0, 1);
    insert.run('Набор «Тишина»', 2400, 'mugs', 'Две пастельные кружки для спокойных вечеров. Созданы для совместных разговоров и уюта.', '/images/cup2.jpg', '[]', 0, 0, 0);
    insert.run('Кружка «Торф»', 1300, 'mugs', 'Тёмный оттенок с лёгким природным узором. Отлично смотрится в современной и классической кухне.', '/images/cup3.jpg', '[]', 0, 0, 0);
    insert.run('Кружка «Весенний луг»', 1900, 'summer', 'Лёгкий цветочный орнамент и мягкие линии ручной лепки. Для медленных завтраков и ароматного чая.', '/images/sumcup2.jpg', '[]', 1, 0, 1);
    insert.run('Кружка «Цветочный дождь»', 1900, 'summer', 'Мелкие красные цветы поднимают настроение даже в пасмурную погоду. Простая радость — в каждой детали.', '/images/sumcup4.jpg', '[]', 1, 0, 1);
    insert.run('Набор кружек «Песочный берег»', 3900, 'mugs', 'Тёплый беж с мягкими, как волны, линиями глазури. Набор из 3-х кружек подарит покой и уют в любой дом.', '/images/cup4.jpg', '[]', 0, 0, 0);
    insert.run('Кружка «Лесная тропа»', 1400, 'mugs', 'Глубокий зелёный цвет с лёгкими вкраплениями. Навевает мысли о прогулках в тенистом лесу.', '/images/cup5.jpg', '[]', 0, 0, 0);
    insert.run('Кружка «Апельсиновая роща»', 1900, 'summer', 'Сочные апельсины и мягкий блеск глазури. Наполняет день бодростью и свежестью.', '/images/sumcup5.jpg', '[]', 1, 0, 1);
    insert.run('Кружка «Клубничное лето»', 1900, 'summer', 'Яркие ягоды и солнечное настроение в каждом глотке. Напоминает о тёплых днях и домашних десертах.', '/images/sumcup3.jpg', '[]', 1, 0, 1);
    
    // ТАРЕЛКИ И МИСКИ
    insert.run('Миска «Линия»', 1900, 'plates', 'Элегантная керамическая миска в современном стиле. Подходит для подачи завтрака, салатов или десертов.', '/images/bowl-beige.jpg', JSON.stringify(['/images/bowl-beige.jpg', '/images/bowl-blue.jpg']), 0, 0, 0);
    insert.run('Миска «Сад у дома»', 2500, 'summer', 'Ручная лепка, зелёный кант и миниатюрные бутоны. Создана для тёплых семейных обедов.', '/images/sumpl1.jpg', '[]', 1, 0, 1);
    insert.run('Набор тарелок «Естественность»', 5000, 'plates', 'Три тарелки необычной формы придают сервировке индивидуальность. Натуральные цвета и ручная работа создают атмосферу уюта.', '/images/plate-beige.jpg', JSON.stringify(['/images/plate-brown.jpg', '/images/plate-beige.jpg', '/images/plate-white.jpg']), 0, 1, 0);
    insert.run('Миска «Рассвет»', 2500, 'summer', 'Лепестки, обрамляющие край, как первые лучи солнца. Идеальна для каши, фруктов или просто хорошего настроения.', '/images/sumpl2.jpg', '[]', 1, 0, 1);
    insert.run('Тарелка «Шум»', 1700, 'plates', 'Керамическая тарелка ручной работы с оригинальной росписью. Возможна персонализация — добавьте индивидуальности своему столу.', '/images/pottery3.jpg', '[]', 0, 1, 0);
    insert.run('Тарелка «Цветочное полотно»', 2400, 'summer', 'Праздничный узор из весенних тюльпанов, обведённый бирюзовым кантом. Прекрасно сочетается с другими изделиями коллекции.', '/images/sumpl3.jpg', '[]', 1, 0, 1);
    insert.run('Набор тарелок «Тёплый ужин»', 5300, 'plates', 'Набор из керамики разных размеров для подачи ужина или завтрака. Тёплые натуральные оттенки создадут уют на вашей кухне.', '/images/set1-beige.jpg', JSON.stringify(['/images/set1-beige.jpg', '/images/set1-black.jpg', '/images/set1-brown.jpg', '/images/set1-librown.jpg']), 0, 0, 0);
    insert.run('Тарелка «Лесная поляна»', 2400, 'summer', 'Тонкий зелёный кант и миниатюрные цветы по краю. Добавит лёгкости и уюта к любому завтраку или десерту.', '/images/sumpl4.jpg', '[]', 1, 0, 1);
    insert.run('Блюдо «Розовый сад»', 2500, 'summer', 'Свежий рисунок в виде цветущих бутонов на вытянутой форме. Идеально для фруктов, выпечки или сервировки летнего стола.', '/images/sumpl5.jpg', '[]', 1, 0, 1);
    
    // ВАЗЫ
    insert.run('Ваза «Скала»', 5300, 'vases', 'Авторская керамическая ваза с выразительной фактурой. Станет необычным украшением интерьера или стильным подарком.', '/images/vase4-beige.jpg', JSON.stringify(['/images/vase4-beige.jpg', '/images/vase4-black.jpg']), 0, 0, 0);
    insert.run('Ваза «Ветер»', 6000, 'vases', 'Современная ваза с плавными, воздушными линиями. Воплощает движение и лёгкость, акцент в любом пространстве.', '/images/vase2-beige.jpg', JSON.stringify(['/images/vase2-white.jpg', '/images/vase2-black.jpg', '/images/vase2-beige.jpg']), 0, 1, 0);
    insert.run('Ваза «Свет»', 4400, 'vases', 'Стильная керамическая ваза со светлой матовой поверхностью. Подходит для цветов или как самостоятельный арт-объект.', '/images/vase3-white.jpg', '[]', 0, 0, 0);
    
    // ЧАЙНИКИ
    insert.run('Чайник «Пауза»', 4100, 'teapots', 'Стильный керамический чайник ручной работы для душевных чаепитий. Сочетает лаконичный дизайн и удобную форму, отлично держит тепло.', '/images/pottery5.jpg', '[]', 0, 1, 0);
    
    // ДЕКОР
    insert.run('Подсвечники «Танец теней»', 3000, 'decor', 'Минималистичные подсвечники, создающие мягкое и тёплое освещение. Ручная работа добавляет уют и особое настроение вашему дому.', '/images/pottery6.jpg', '[]', 0, 0, 0);
    insert.run('Горшок для растений «Лесная скала»', 5500, 'decor', 'Керамический горшок для комнатных растений или декора. Приятная фактура и естественные цвета подчеркнут красоту вашей зелени.', '/images/pottery7.jpg', '[]', 0, 0, 0);
    
    console.log('✅ Добавлено 25 товаров');
} else {
    console.log(`✅ В базе уже есть ${count.count} товаров`);
}

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