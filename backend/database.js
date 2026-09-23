const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./faenas.db", (err) => {
    if (err) {
        console.error("Error al conectar con SQLite:", err.message);
    } else {
        console.log("Conectado a SQLite.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS trabajadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        rut TEXT NOT NULL UNIQUE,
        cargo TEXT NOT NULL,
        telefono TEXT,
        antecedentes TEXT
    )
`, (err) => {
    if (err) {
        console.error("Error al crear la tabla:", err.message);
    } else {
        console.log("Tabla trabajadores lista.");
    }
});

module.exports = db;