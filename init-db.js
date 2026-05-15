const Database = require('better-sqlite3');
const fs = require('fs');

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Добавляем тестовые товары, если таблица пустая
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
    console.log('📦 Добавляем тестовые товары...');
    
    const insert = db.prepare(`
        INSERT INTO products (name, price, category, description, image, color_variants, is_summer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run('Кружка «Гармония»', 1200, 'mugs', 'Тёплая кружка ручной работы.', '/images/cup-beige.jpg', JSON.stringify(['/images/cup-beige.jpg', '/images/cup-white.jpg']), 0);
    insert.run('Кружка «Тюльпан»', 1900, 'summer', 'Нежная кружка с цветочным рисунком.', '/images/sumcup1.jpg', '[]', 1);
    insert.run('Ваза «Ветер»', 6000, 'vases', 'Современная ваза с плавными линиями.', '/images/vase2-beige.jpg', JSON.stringify(['/images/vase2-white.jpg', '/images/vase2-black.jpg', '/images/vase2-beige.jpg']), 0);
    insert.run('Чайник «Пауза»', 4100, 'teapots', 'Стильный чайник для душевных чаепитий.', '/images/pottery5.jpg', '[]', 0);
    insert.run('Набор тарелок «Естественность»', 5000, 'plates', 'Три тарелки необычной формы.', '/images/plate-beige.jpg', JSON.stringify(['/images/plate-brown.jpg', '/images/plate-beige.jpg', '/images/plate-white.jpg']), 0);
    insert.run('Кружка «Лесная тропа»', 1400, 'mugs', 'Глубокий зелёный цвет.', '/images/cup5.jpg', '[]', 0);
    
    console.log('✅ Добавлены тестовые товары');
}

console.log('✅ База данных создана');
db.close();