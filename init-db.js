const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/clayart.db');

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            image TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer TEXT,
            phone TEXT,
            address TEXT,
            items TEXT,
            total INTEGER
        )
    `);

    console.log('База данных создана');

});

db.close();