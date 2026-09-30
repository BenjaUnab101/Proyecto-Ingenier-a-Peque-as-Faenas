const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./faenas.db", (err) => {
    if (err) {
        console.error("Error al conectar con SQLite:", err.message);
    } else {
        console.log("Conectado a SQLite.");
    }
});

db.run("PRAGMA foreign_keys = ON");

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
        console.error("Error al crear la tabla trabajadores:", err.message);
    } else {
        console.log("Tabla trabajadores lista.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS ingresos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trabajador_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        ubicacion TEXT NOT NULL,
        FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id)
    )
`, (err) => {
    if (err) {
        console.error("Error al crear la tabla ingresos:", err.message);
    } else {
        console.log("Tabla ingresos lista.");
    }
});

module.exports = db;