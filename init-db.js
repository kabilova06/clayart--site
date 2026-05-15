const Database = require('better-sqlite3');
const fs = require('fs');

if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

const db = new Database('./database/clayart.db');

// Создаём таблицы с новыми полями
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

// Добавляем новые колонки, если их нет (для обновления существующей БД)
try {
    db.exec(`ALTER TABLE products ADD COLUMN is_bestseller INTEGER DEFAULT 0`);
} catch(e) {}
try {
    db.exec(`ALTER TABLE products ADD COLUMN is_new INTEGER DEFAULT 0`);
} catch(e) {}

// Добавляем тестовые товары, если таблица пустая
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
    console.log('📦 Добавляем тестовые товары...');
    
    const insert = db.prepare(`
        INSERT INTO products (name, price, category, description, image, color_variants, is_summer, is_bestseller, is_new)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Бестселлеры (is_bestseller = 1)
    insert.run('Кружка «Гармония»', 1200, 'mugs', 'Тёплая кружка ручной работы для уютных моментов.', '/images/cup-beige.jpg', JSON.stringify(['/images/cup-beige.jpg', '/images/cup-white.jpg']), 0, 1, 0);
    insert.run('Набор тарелок «Естественность»', 5000, 'plates', 'Три тарелки необычной формы придают сервировке индивидуальность.', '/images/plate-beige.jpg', JSON.stringify(['/images/plate-brown.jpg', '/images/plate-beige.jpg', '/images/plate-white.jpg']), 0, 1, 0);
    insert.run('Тарелка «Шум»', 1700, 'plates', 'Керамическая тарелка ручной работы с оригинальной росписью.', '/images/pottery3.jpg', '[]', 0, 1, 0);
    insert.run('Ваза «Ветер»', 6000, 'vases', 'Современная ваза с плавными, воздушными линиями.', '/images/vase2-beige.jpg', JSON.stringify(['/images/vase2-white.jpg', '/images/vase2-black.jpg', '/images/vase2-beige.jpg']), 0, 1, 0);
    insert.run('Чайник «Пауза»', 4100, 'teapots', 'Стильный керамический чайник ручной работы для душевных чаепитий.', '/images/pottery5.jpg', '[]', 0, 1, 0);
    
    // Новинки (is_new = 1)
    insert.run('Кружка «Тюльпан»', 1900, 'summer', 'Нежная керамическая кружка с наивным цветочным рисунком.', '/images/sumcup1.jpg', '[]', 1, 0, 1);
    insert.run('Блюдо «Розовый сад»', 2500, 'summer', 'Свежий рисунок в виде цветущих бутонов на вытянутой форме.', '/images/sumpl5.jpg', '[]', 1, 0, 1);
    insert.run('Кружка «Апельсиновая роща»', 1900, 'summer', 'Сочные апельсины и мягкий блеск глазури.', '/images/sumcup5.jpg', '[]', 1, 0, 1);
    insert.run('Кружка «Клубничное лето»', 1900, 'summer', 'Яркие ягоды и солнечное настроение в каждом глотке.', '/images/sumcup3.jpg', '[]', 1, 0, 1);
    insert.run('Миска «Сад у дома»', 2500, 'summer', 'Ручная лепка, зелёный кант и миниатюрные бутоны.', '/images/sumpl1.jpg', '[]', 1, 0, 1);
    
    // Обычные товары
    insert.run('Ваза «Скала»', 5300, 'vases', 'Авторская керамическая ваза с выразительной фактурой.', '/images/vase4-beige.jpg', JSON.stringify(['/images/vase4-beige.jpg', '/images/vase4-black.jpg']), 0, 0, 0);
    insert.run('Подсвечники «Танец теней»', 3000, 'decor', 'Минималистичные подсвечники, создающие мягкое и тёплое освещение.', '/images/pottery6.jpg', '[]', 0, 0, 0);
    insert.run('Горшок для растений «Лесная скала»', 5500, 'decor', 'Керамический горшок для комнатных растений или декора.', '/images/pottery7.jpg', '[]', 0, 0, 0);
    
    console.log('✅ Добавлены тестовые товары с отметками бестселлеров и новинок');
}

console.log('✅ База данных создана');
db.close();