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

//db0.run('INSERT INTO usuarios (username, password) VALUES (?, ?)', ['admin', '123456'], (err) => {
   // if (err) console.error('Error al insertar usuario de prueba:', err.message);
    //else console.log('Usuario de prueba insertado: admin / 123456');
//});


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





// Conexión a la base de datos SQLite
const dbI = new sqlite3.Database('./productos.db', (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear tabla si no existe
dbI.run(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
    )
`);

// Rutas de la API

// Obtener todos los productos
app.get('/api/products', (req, res) => {
    dbI.all('SELECT * FROM productos', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Obtener un producto por ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    dbI.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
        }
    });
});

// Crear un nuevo producto
app.post('/api/products', (req, res) => {
    const { name, quantity, price } = req.body;
    dbI.run(
        'INSERT INTO productos (name, quantity, price) VALUES (?, ?, ?)',
        [name, quantity, price],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID });
            }
        }
    );
});

// Actualizar un producto
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const { name, quantity, price } = req.body;

    dbI.run(
        'UPDATE productos SET name = ?, quantity = ?, price = ? WHERE id = ?',
        [name, quantity, price, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Producto actualizado correctamente.' });
            }
        }
    );
});

// Eliminar un producto
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;

    dbI.run('DELETE FROM productos WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Producto eliminado correctamente.' });
        }
    });
});

// Ruta para obtener clientes
app.get('/api/clientes', (req, res) => {
    const query = 'SELECT * FROM clientes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            res.status(500).send('Error al obtener datos');
            return;
        }
        res.json(results);
    });
});

////////     
// Crear tabla de pedidos si no existe
dbI.run(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES productos (id)
    )
`);

// Ruta para crear un pedido
app.post('/api/orders', (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Datos inválidos.' });
    }

    // Verificar si hay suficiente inventario
    dbI.get('SELECT * FROM productos WHERE id = ?', [productId], (err, product) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ error: 'Cantidad insuficiente en inventario.' });
        }

        // Crear el pedido y actualizar inventario
        dbI.run(
            'INSERT INTO orders (productId, quantity) VALUES (?, ?)',
            [productId, quantity],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Descontar del inventario
                const newQuantity = product.quantity - quantity;
                dbI.run(
                    'UPDATE productos SET quantity = ? WHERE id = ?',
                    [newQuantity, productId],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        res.json({ message: 'Pedido realizado exitosamente.' });
                    }
                );
            }
        );
    });
});

// Ruta para obtener todos los pedidos
app.get('/api/orders', (req, res) => {
    dbI.all(
        `SELECT orders.id, productos.name AS productName, orders.quantity, orders.date
         FROM orders
         JOIN productos ON orders.productId = productos.id`,
        [],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        }
    );
});




///Para mostrar.html

// Obtener cliente por ID
app.get('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, cliente) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(cliente);
        }
    });
});

// Actualizar cliente
app.put('/api/clientes/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, correo, telefono } = req.body;
    db.run(
        'UPDATE clientes SET nombre = ?, correo = ?, telefono = ? WHERE id = ?',
        [nombre, correo, telefono, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Cliente actualizado correctamente.' });
            }
        }
    );
});





// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});