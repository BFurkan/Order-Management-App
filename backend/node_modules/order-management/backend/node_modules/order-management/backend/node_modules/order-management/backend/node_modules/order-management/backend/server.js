const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3001;

// MySQL configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'order_tracking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();  // Using promise-based API for cleaner async/await usage

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

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await pool.getConnection();
    next();
  } catch (err) {
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

// Add new product
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

// Get latest order ID
app.get('/latest-order-id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT MAX(order_id) AS latest_order_id FROM orders');
    const latestOrderId = rows[0].latest_order_id || '0';  // Default to '0' if no orders exist
    res.status(200).json({ latest_order_id: latestOrderId });
  } catch (err) {
    console.error('Error fetching latest order ID:', err.message);
    res.status(500).send('Error fetching latest order ID: ' + err.message);
  }
});

// Place a new order
app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date } = req.body;

    if (!product_id || !quantity || !order_date) {
      return res.status(400).send('Missing required fields');
    }

    const newOrderId = '-';
    await pool.query('INSERT INTO orders (order_id, product_id, quantity, order_date, confirmed_quantity) VALUES (?, ?, ?, ?, 0)', [newOrderId, product_id, quantity, order_date]);

    res.status(201).json({ message: 'Order placed successfully', order_id: newOrderId });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order: ' + err.message);
  }
});

// Update confirmed quantity and total quantity for an order
app.post('/confirm', async (req, res) => {
  try {
    const { order_id, product_id, confirmQuantity } = req.body;

    const [rows] = await pool.query('SELECT quantity, confirmed_quantity FROM orders WHERE order_id = ? AND product_id = ?', [order_id, product_id]);

    if (rows.length === 0) {
      return res.status(404).send('Order not found');
    }

    const currentQuantity = rows[0].quantity;
    const currentConfirmedQuantity = rows[0].confirmed_quantity;

    const newConfirmedQuantity = currentConfirmedQuantity + confirmQuantity;
    const newTotalQuantity = currentQuantity - confirmQuantity;

    await pool.query('UPDATE orders SET confirmed_quantity = ?, quantity = ? WHERE order_id = ? AND product_id = ?', [newConfirmedQuantity, newTotalQuantity, order_id, product_id]);

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (err) {
    console.error('Error confirming order:', err.message);
    res.status(500).send('Error confirming order: ' + err.message);
  }
});

// Update order ID
app.post('/update-order-id', async (req, res) => {
  try {
    const { id, newOrderId } = req.body;

    const result = await pool.query('UPDATE orders SET order_id = ? WHERE id = ? AND order_id IS NULL', [newOrderId, id]);

    if (result[0].affectedRows > 0) {
      res.status(200).json({ message: 'Order ID updated successfully' });
    } else {
      res.status(404).json({ message: 'No matching order found' });
    }
  } catch (err) {
    console.error('Error updating order ID:', err.message);
    res.status(500).send('Error updating order ID');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
