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

// Obtener trabajadores para registrar ingreso
app.get("/trabajadores/ingreso", (req, res) => {
    db.all(
        "SELECT id, nombre, rut, cargo FROM trabajadores ORDER BY nombre ASC",
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

// Registrar ingreso
app.post("/ingresos", (req, res) => {
    const { trabajador_id, ubicacion } = req.body;

    if (!trabajador_id || !ubicacion) {
        return res.status(400).json({
            error: "Trabajador y ubicación son obligatorios."
        });
    }

    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-CL");
    const hora = ahora.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const sql = `
        INSERT INTO ingresos
        (trabajador_id, fecha, hora, ubicacion)
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [trabajador_id, fecha, hora, ubicacion],
        function (err) {
            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    error: "No fue posible registrar el ingreso."
                });
            }

            res.status(201).json({
                mensaje: "Ingreso registrado correctamente.",
                ingreso: {
                    id: this.lastID,
                    trabajador_id,
                    fecha,
                    hora,
                    ubicacion
                }
            });
        }
    );
});

// Obtener trabajadores actualmente presentes
app.get("/trabajadores/presentes", (req, res) => {

    const sql = `
        SELECT
            t.id,
            t.nombre,
            t.rut,
            t.cargo
        FROM trabajadores t
        INNER JOIN ingresos i
            ON t.id = i.trabajador_id
        WHERE i.id = (
            SELECT MAX(i2.id)
            FROM ingresos i2
            WHERE i2.trabajador_id = t.id
        )
        AND NOT EXISTS (
            SELECT 1
            FROM salidas s
            WHERE s.trabajador_id = t.id
            AND s.id > i.id
        )
        ORDER BY t.nombre ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error(err.message);

            return res.status(500).json({
                error: "No fue posible obtener los trabajadores presentes."
            });
        }

        res.json(rows);
    });
});

// Registrar salida
app.post("/salidas", (req, res) => {

    const { trabajador_id } = req.body;

    if (!trabajador_id) {
        return res.status(400).json({
            error: "Debe seleccionar un trabajador."
        });
    }

    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-CL");

    const hora = ahora.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    // Verificar que el trabajador esté actualmente presente
    const sqlPresente = `
        SELECT t.id
        FROM trabajadores t
        INNER JOIN ingresos i
            ON t.id = i.trabajador_id
        WHERE t.id = ?
        AND i.id = (
            SELECT MAX(i2.id)
            FROM ingresos i2
            WHERE i2.trabajador_id = t.id
        )
        AND NOT EXISTS (
            SELECT 1
            FROM salidas s
            WHERE s.trabajador_id = t.id
            AND s.id > i.id
        )
    `;

    db.get(sqlPresente, [trabajador_id], (err, trabajador) => {

        if (err) {
            console.error(err.message);

            return res.status(500).json({
                error: "No fue posible verificar el trabajador."
            });
        }

        if (!trabajador) {
            return res.status(400).json({
                error: "El trabajador no se encuentra actualmente dentro de la faena."
            });
        }

        const sqlSalida = `
            INSERT INTO salidas
            (trabajador_id, fecha, hora)
            VALUES (?, ?, ?)
        `;

        db.run(
            sqlSalida,
            [trabajador_id, fecha, hora],
            function (err) {

                if (err) {
                    console.error(err.message);

                    return res.status(500).json({
                        error: "No fue posible registrar la salida."
                    });
                }

                res.status(201).json({
                    mensaje: "Salida registrada correctamente.",
                    salida: {
                        id: this.lastID,
                        trabajador_id,
                        fecha,
                        hora
                    }
                });
            }
        );
    });
});

// ============================
// HU5 - HISTORIAL DE MOVIMIENTOS
// ============================

app.get("/trabajadores/:id/historial", (req, res) => {

    const trabajadorId = req.params.id;

    const sql = `
        SELECT
            'Entrada' AS tipo,
            fecha,
            hora,
            ubicacion
        FROM ingresos
        WHERE trabajador_id = ?

        UNION ALL

        SELECT
            'Salida' AS tipo,
            fecha,
            hora,
            NULL AS ubicacion
        FROM salidas
        WHERE trabajador_id = ?

        ORDER BY fecha DESC, hora DESC
    `;

    db.all(
        sql,
        [trabajadorId, trabajadorId],
        (err, rows) => {

            if (err) {

                console.error(err.message);

                return res.status(500).json({
                    error: "No fue posible obtener el historial del trabajador."
                });

            }

            res.json(rows);

        }
    );

});

// La linea 332 hace que Express sirva al propio frontend y no usemos POSTMAN para probar la API.
app.use(express.static("../"));

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});