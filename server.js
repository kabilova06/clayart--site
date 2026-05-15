const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(express.static('public'));

const db = new sqlite3.Database('./database/clayart.db');

/* =========================
   ДОБАВЛЕНИЕ ЗАКАЗА
========================= */

app.post('/api/order', (req, res) => {

    const {
        customer,
        phone,
        address,
        items,
        total
    } = req.body;

    db.run(
        `
        INSERT INTO orders
        (
            customer,
            phone,
            address,
            items,
            total
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            customer,
            phone,
            address,
            JSON.stringify(items),
            total
        ],
        function(err) {

            if(err) {

                console.log(err);

                return res.status(500).json({
                    error: 'Ошибка базы данных'
                });
            }

            res.json({
                success: true,
                orderId: this.lastID
            });
        }
    );
});

/* =========================
   ПОЛУЧЕНИЕ ЗАКАЗОВ
========================= */

app.get('/api/orders', (req, res) => {

    db.all(
        'SELECT * FROM orders ORDER BY id DESC',
        [],
        (err, rows) => {

            if(err) {

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});

/* =========================
   ЗАПУСК
========================= */

const PORT = 3000;

app.listen(PORT, () => {

    console.log(`
Сервер запущен:
http://localhost:${PORT}
    `);
});