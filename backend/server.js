const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3001;

// MSSQL Database configuration
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'your_password',
  server: process.env.DB_SERVER || 'your_server',
  database: process.env.DB_NAME || 'order_tracking',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: true, // for Azure, set to false for local
    trustServerCertificate: true, // for self-signed certificates
  },
};

const poolPromise = sql.connect(config).then(pool => {
  console.log('Connected to MSSQL database');
  return pool;
}).catch(err => {
  console.error('Database connection error:', err);
  throw err;
});

app.use(cors());
app.use(express.json());

// Serve images from the public/images directory
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

const upload = multer({ storage });

// Ensure database connection middleware
app.use(async (req, res, next) => {
  try {
    await poolPromise;
    next();
  } catch (err) {
    res.status(500).send('Database connection error');
  }
});

// Fetch all products
app.get('/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM products');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products');
  }
});

// Fetch a single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM products WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).send('Product not found');
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).send('Error fetching product');
  }
});

// Add a new order
app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date } = req.body;

    if (!product_id || !quantity || !order_date) {
      return res.status(400).send('Missing required fields');
    }

    const pool = await poolPromise;
    await pool.request()
      .input('product_id', sql.Int, product_id)
      .input('quantity', sql.Int, quantity)
      .input('order_date', sql.Date, order_date)
      .input('confirmed_quantity', sql.Int, 0)
      .query('INSERT INTO orders (product_id, quantity, order_date, confirmed_quantity) VALUES (@product_id, @quantity, @order_date, @confirmed_quantity)');

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order');
  }
});

// Fetch all orders
app.get('/orders', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM orders');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Error fetching orders');
  }
});

// Confirm an order by updating quantity and confirmed quantity
app.post('/confirm', async (req, res) => {
  try {
    const { order_id, product_id, confirmQuantity } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('order_id', sql.VarChar, order_id)
      .input('product_id', sql.Int, product_id)
      .query('SELECT quantity, confirmed_quantity FROM orders WHERE order_id = @order_id AND product_id = @product_id');

    const currentQuantity = result.recordset[0].quantity;
    const currentConfirmedQuantity = result.recordset[0].confirmed_quantity;

    const newConfirmedQuantity = currentConfirmedQuantity + confirmQuantity;
    const newTotalQuantity = currentQuantity - confirmQuantity;

    await pool.request()
      .input('order_id', sql.VarChar, order_id)
      .input('product_id', sql.Int, product_id)
      .input('newConfirmedQuantity', sql.Int, newConfirmedQuantity)
      .input('newTotalQuantity', sql.Int, newTotalQuantity)
      .query('UPDATE orders SET confirmed_quantity = @newConfirmedQuantity, quantity = @newTotalQuantity WHERE order_id = @order_id AND product_id = @product_id');

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (err) {
    console.error('Error confirming order:', err.message);
    res.status(500).send('Error confirming order');
  }
});

// Update order ID
app.post('/update-order-id', async (req, res) => {
  try {
    const { oldOrderId, newOrderId } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('oldOrderId', sql.VarChar, oldOrderId)
      .input('newOrderId', sql.VarChar, newOrderId)
      .query('UPDATE orders SET order_id = @newOrderId WHERE order_id = @oldOrderId');

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Order ID updated successfully' });
    } else {
      res.status(404).json({ message: 'Order ID not found' });
    }
  } catch (error) {
    console.error('Error updating order ID:', error.message);
    res.status(500).send('Error updating order ID');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
