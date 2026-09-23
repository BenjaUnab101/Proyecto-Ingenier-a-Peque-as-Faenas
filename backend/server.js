const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Registrar trabajador
app.post("/trabajadores", (req, res) => {
    const { nombre, rut, cargo, telefono, antecedentes } = req.body;

    if (!nombre || !rut || !cargo) {
        return res.status(400).json({
            error: "Nombre, RUT y cargo son obligatorios."
        });
    }

    const sql = `
        INSERT INTO trabajadores
        (nombre, rut, cargo, telefono, antecedentes)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [nombre, rut, cargo, telefono || "", antecedentes || ""],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        error: "Ya existe un trabajador registrado con ese RUT."
                    });
                }

                console.error(err.message);

                return res.status(500).json({
                    error: "No fue posible registrar el trabajador."
                });
            }

            res.status(201).json({
                mensaje: "Trabajador registrado correctamente.",
                trabajador: {
                    id: this.lastID,
                    nombre,
                    rut,
                    cargo,
                    telefono: telefono || "",
                    antecedentes: antecedentes || ""
                }
            });
        }
    );
});

// Obtener trabajadores
app.get("/trabajadores", (req, res) => {
    db.all(
        "SELECT * FROM trabajadores ORDER BY id DESC",
        [],
        (err, rows) => {
            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    error: "No fue posible obtener los trabajadores."
                });
            }

            res.json(rows);
        }
    );
});
// La linea 79 hace que Express sirva al propio frontend y no usemos POSTMAN para probar la API.
app.use(express.static("../"));

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});