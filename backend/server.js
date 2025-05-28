import express from 'express';
import mysql from 'mysql2/promise'; // Use promise-based API for async/await
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3004;

// MySQL configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'asset',
  password: process.env.DB_PASSWORD || 'AssetJito2024$',
  database: process.env.DB_NAME || 'order_tracking',
  port:3306,
  connectionLimit: 10,
  queueLimit: 0,
});

// Set up multer for file uploads
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  },
});

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // To handle JSON requests
app.use('/images', express.static(imagesDir)); // Serve uploaded images

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
   connection.release();
    next();
  } catch (err) {
   console.error('Database connection error:', err);
    res.status(500).send('Database connection error');
  }
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products: ' + err.message);
  }
});

// Get a single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).send('Product not found');
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).send('Error fetching product: ' + err.message);
  }
});

// Add a new product
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, category } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    await pool.query('INSERT INTO products (name, category, image) VALUES (?, ?, ?)', [name, category, image]);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).send('Error adding product: ' + err.message);
  }
});

// Get the latest order ID
app.get('/latest-order-id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT order_id FROM orders ORDER BY id DESC LIMIT 1');

    const latestOrderId = rows[0]?.order_id || '-';
    res.status(200).json({ latest_order_id: latestOrderId });
  } catch (err) {
    console.error('Error fetching latest order ID:', err.message);
    res.status(500).send('Error fetching latest order ID: ' + err.message);
  }
});

// Place a new order
app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date, order_id } = req.body;

    if (!product_id || !quantity || !order_date) {
      return res.status(400).send('Missing required fields');
    }

        let newOrderId = result.insertId;
    if (!newOrderId){
        const [result] = await pool.query(
      'INSERT INTO orders (product_id, quantity, order_date, confirmed_quantity, order_id) VALUES (?, ?, ?, 0, NULL)',
      [product_id, quantity, order_date]
    );
    const newOrderId = result.insertId;
    await pool.query(
      'UPDATE orders SET order_id = ? WHERE id = ?',
      [newOrderId, newOrderId]
    );
} else{
      await pool.query(
        'INSERT INTO orders (product_id, quantity, order_date, confirmed_quantity, order_id) VALUES (?, ?, ?, 0, ?)',
        [product_id, quantity, order_date, newOrderId]
      );
}

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order: ' + err.message);
  }
});

// Get all orders
app.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.product_id, o.quantity, o.order_date, o.confirmed_quantity, o.order_id, p.name AS product_name, p.image
      FROM orders o
      JOIN products p ON o.product_id = p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Error fetching orders: ' + err.message);
  }
});

// Confirm an order
app.post('/confirm', async (req, res) => {
try {
    const { order_id, product_id, serialNumber } = req.body;
            const confirmQuantity = 1;

    const [rows] = await pool.query('SELECT quantity, confirmed_quantity, serial_numbers FROM orders WHERE order_id = ? AND product_id = ?', [order_id, product_id]);

    if (rows.length === 0) {
      return res.status(404).send('Order not found');
    }

    const currentQuantity = rows[0].quantity;
    const currentConfirmedQuantity = rows[0].confirmed_quantity;

    if (currentQuantity <= 0) {
      return res.status(400).send('Cannot confirm more than available quantity');
    }

    const newConfirmedQuantity = currentConfirmedQuantity + confirmQuantity;
    const newTotalQuantity = currentQuantity - confirmQuantity;
    let updatedSerialNumbers = rows[0].serial_numbers ? JSON.parse(rows[0].serial_numbers): [];

    updatedSerialNumbers.push(serialNumber);

    await pool.query('UPDATE orders SET confirmed_quantity = ?, quantity = ?, confirm_date = ?, serial_numbers = ?  WHERE order_id = ? AND product_id = ?', [newConfirmedQuantity, newTotalQuantity, new Date(), JSON.stringify(updatedSerialNumbers), order_id, product_id]);

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (err) {
    console.error('Error confirming order:', err.message);
    res.status(500).send('Error confirming order: ' + err.message);
  }
});

// Update an order ID
app.post('/update-order-id', async (req, res) => {
  try {
    const { oldOrderId, newOrderId } = req.body;

    const [result] = await pool.query('UPDATE orders SET order_id = ? WHERE order_id = ?', [newOrderId, oldOrderId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Order ID updated successfully' });
    } else {
      res.status(404).json({ message: 'Order ID not found' });
    }
  } catch (err) {
    console.error('Error updating order ID:', err.message);
    res.status(500).send('Error updating order ID: ' + err.message);
  }
});

// Get confirmed items
app.get('/confirmed-items', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, p.name AS product_name, o.confirmed_quantity AS quantity, o.order_date, o.confirm_date, o.order_id
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.confirmed_quantity > 0
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching confirmed items:', err.message);
    res.status(500).send('Error fetching confirmed items: ' + err.message);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});


