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
        is_bestseller INTEGER DEFAULT 0,
        is_new INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Удаляем старые товары и добавляем все 25 заново
db.prepare('DELETE FROM products').run();

const insert = db.prepare(`
    INSERT INTO products (name, price, category, description, image, color_variants, is_summer, is_bestseller, is_new)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('📦 Добавляем 25 товаров...');

// ========== КРУЖКИ ==========
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

// ========== ТАРЕЛКИ И МИСКИ ==========
insert.run('Миска «Линия»', 1900, 'plates', 'Элегантная керамическая миска в современном стиле. Подходит для подачи завтрака, салатов или десертов.', '/images/bowl-beige.jpg', JSON.stringify(['/images/bowl-beige.jpg', '/images/bowl-blue.jpg']), 0, 0, 0);
insert.run('Миска «Сад у дома»', 2500, 'summer', 'Ручная лепка, зелёный кант и миниатюрные бутоны. Создана для тёплых семейных обедов.', '/images/sumpl1.jpg', '[]', 1, 0, 1);
insert.run('Набор тарелок «Естественность»', 5000, 'plates', 'Три тарелки необычной формы придают сервировке индивидуальность. Натуральные цвета и ручная работа создают атмосферу уюта.', '/images/plate-beige.jpg', JSON.stringify(['/images/plate-brown.jpg', '/images/plate-beige.jpg', '/images/plate-white.jpg']), 0, 1, 0);
insert.run('Миска «Рассвет»', 2500, 'summer', 'Лепестки, обрамляющие край, как первые лучи солнца. Идеальна для каши, фруктов или просто хорошего настроения.', '/images/sumpl2.jpg', '[]', 1, 0, 1);
insert.run('Тарелка «Шум»', 1700, 'plates', 'Керамическая тарелка ручной работы с оригинальной росписью. Возможна персонализация — добавьте индивидуальности своему столу.', '/images/pottery3.jpg', '[]', 0, 1, 0);
insert.run('Тарелка «Цветочное полотно»', 2400, 'summer', 'Праздничный узор из весенних тюльпанов, обведённый бирюзовым кантом. Прекрасно сочетается с другими изделиями коллекции.', '/images/sumpl3.jpg', '[]', 1, 0, 1);
insert.run('Набор тарелок «Тёплый ужин»', 5300, 'plates', 'Набор из керамики разных размеров для подачи ужина или завтрака. Тёплые натуральные оттенки создадут уют на вашей кухне.', '/images/set1-beige.jpg', JSON.stringify(['/images/set1-beige.jpg', '/images/set1-black.jpg', '/images/set1-brown.jpg', '/images/set1-librown.jpg']), 0, 0, 0);
insert.run('Тарелка «Лесная поляна»', 2400, 'summer', 'Тонкий зелёный кант и миниатюрные цветы по краю. Добавит лёгкости и уюта к любому завтраку или десерту.', '/images/sumpl4.jpg', '[]', 1, 0, 1);
insert.run('Блюдо «Розовый сад»', 2500, 'summer', 'Свежий рисунок в виде цветущих бутонов на вытянутой форме. Идеально для фруктов, выпечки или сервировки летнего стола.', '/images/sumpl5.jpg', '[]', 1, 0, 1);

// ========== ВАЗЫ ==========
insert.run('Ваза «Скала»', 5300, 'vases', 'Авторская керамическая ваза с выразительной фактурой. Станет необычным украшением интерьера или стильным подарком.', '/images/vase4-beige.jpg', JSON.stringify(['/images/vase4-beige.jpg', '/images/vase4-black.jpg']), 0, 0, 0);
insert.run('Ваза «Ветер»', 6000, 'vases', 'Современная ваза с плавными, воздушными линиями. Воплощает движение и лёгкость, акцент в любом пространстве.', '/images/vase2-beige.jpg', JSON.stringify(['/images/vase2-white.jpg', '/images/vase2-black.jpg', '/images/vase2-beige.jpg']), 0, 1, 0);
insert.run('Ваза «Свет»', 4400, 'vases', 'Стильная керамическая ваза со светлой матовой поверхностью. Подходит для цветов или как самостоятельный арт-объект.', '/images/vase3-white.jpg', '[]', 0, 0, 0);

// ========== ЧАЙНИКИ ==========
insert.run('Чайник «Пауза»', 4100, 'teapots', 'Стильный керамический чайник ручной работы для душевных чаепитий. Сочетает лаконичный дизайн и удобную форму, отлично держит тепло.', '/images/pottery5.jpg', '[]', 0, 1, 0);

// ========== ДЕКОР ==========
insert.run('Подсвечники «Танец теней»', 3000, 'decor', 'Минималистичные подсвечники, создающие мягкое и тёплое освещение. Ручная работа добавляет уют и особое настроение вашему дому.', '/images/pottery6.jpg', '[]', 0, 0, 0);
insert.run('Горшок для растений «Лесная скала»', 5500, 'decor', 'Керамический горшок для комнатных растений или декора. Приятная фактура и естественные цвета подчеркнут красоту вашей зелени.', '/images/pottery7.jpg', '[]', 0, 0, 0);

console.log('✅ Добавлено 25 товаров');

db.close();