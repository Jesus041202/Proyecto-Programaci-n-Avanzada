const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Configurar SQLite
const db = new sqlite3.Database('./clientes.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear tabla de clientes si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL,
        telefono TEXT NOT NULL
    )
`);

// Rutas de la API
// Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
    db.all('SELECT * FROM clientes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Registrar un nuevo cliente
app.post('/api/clientes', (req, res) => {
    const { nombre, correo, telefono } = req.body;
    if (!nombre || !correo || !telefono) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const query = `INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)`;
    db.run(query, [nombre, correo, telefono], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, nombre, correo, telefono });
        }
    });
});

// Eliminar cliente por ID
app.delete('/api/eliminar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const query = `DELETE FROM clientes WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Cliente no encontrado.' });
        } else {
            res.json({ success: true });
        }
    });
});

// Conectar o crear la base de datos `users.db`
const db0 = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear tabla de usuarios si no existe
db0.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

// Insertar un usuario de ejemplo (solo si la tabla está vacía)
db0.get('SELECT COUNT(*) AS count FROM usuarios', [], (err, row) => {
    if (err) {
        console.error('Error al verificar la tabla usuarios:', err.message);
    } else if (row.count === 0) {
        const query = `INSERT INTO usuarios (username, password) VALUES (?, ?)`;
        db.run(query, ['admin', '123456'], (err) => {
            if (err) {
                console.error('Error al insertar usuario inicial:', err.message);
            } else {
                console.log('Usuario inicial creado: admin / 123456');
            }
        });
    }
});

// Ruta para inicio de sesión
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const query = `SELECT * FROM usuarios WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, user) => {
        if (err) {
            res.status(500).json({ error: 'Error del servidor.' });
        } else if (!user) {
            res.status(401).json({ error: 'Credenciales incorrectas.' });
        } else {
            res.json({ success: true, message: 'Inicio de sesión exitoso.' });
        }
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
