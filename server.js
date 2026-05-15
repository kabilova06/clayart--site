const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Файл для хранения заказов
const ordersFile = './database/orders.json';

// Создаём папку database, если её нет
if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database');
}

// Создаём файл с заказами, если его нет
if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([]));
}

// ========== API ДЛЯ ЗАКАЗОВ ==========

// Сохранение заказа
app.post('/api/order', (req, res) => {
    const { customer, phone, address, items, total } = req.body;
    
    // Читаем существующие заказы
    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    
    // Создаём новый заказ
    const newOrder = {
        id: orders.length + 1,
        customer,
        phone,
        address,
        items,
        total,
        created_at: new Date().toISOString()
    };
    
    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    
    res.json({ success: true, orderId: newOrder.id });
});

// Получение всех заказов
app.get('/api/orders', (req, res) => {
    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    res.json(orders.reverse()); // новые заказы первыми
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