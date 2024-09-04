const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3001;

const config = {
  server: process.env.DB_SERVER || 'jus000vm5374',
  database: process.env.DB_NAME || 'order_tracking',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '2130Queen!',
  port: process.env.DB_PORT || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Database connection
const poolPromise = sql.connect(config).then(pool => {
  console.log('Connected to MSSQL database');
  return pool;
}).catch(err => {
  console.error('Database connection error:', err);
  throw err;
});

// Middleware
app.use(cors());
app.use(express.json());

// Static files for images
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
app.use('/images', express.static(imagesDir));

// Multer setup for file uploads
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

// Routes
app.get('/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM products');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products: ' + err.message);
  }
});

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
    res.status(500).send('Error fetching product: ' + err.message);
  }
});

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

app.post('/confirm', async (req, res) => {
  try {
    const { order_id, product_id, confirmQuantity } = req.body;

    const pool = await poolPromise;

    // Get the current values
    const result = await pool.request()
      .input('order_id', sql.VarChar, order_id)
      .input('product_id', sql.Int, product_id)
      .query(`
        SELECT quantity, confirmed_quantity
        FROM orders
        WHERE order_id = @order_id AND product_id = @product_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).send('Order not found');
    }

    const currentQuantity = result.recordset[0].quantity;
    const currentConfirmedQuantity = result.recordset[0].confirmed_quantity;

    // Calculate the new values
    const newConfirmedQuantity = currentConfirmedQuantity + confirmQuantity;
    const newTotalQuantity = currentQuantity - confirmQuantity;

    // Update the database with the new values
    await pool.request()
      .input('order_id', sql.VarChar, order_id)
      .input('product_id', sql.Int, product_id)
      .input('newConfirmedQuantity', sql.Int, newConfirmedQuantity)
      .input('newTotalQuantity', sql.Int, newTotalQuantity)
      .query(`
        UPDATE orders
        SET confirmed_quantity = @newConfirmedQuantity,
            quantity = @newTotalQuantity
        WHERE order_id = @order_id AND product_id = @product_id
      `);

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (err) {
    console.error('Error confirming order:', err.message);
    res.status(500).send('Error confirming order');
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date } = req.body;

    if (!product_id || !quantity || !order_date) {
      return res.status(400).send('Missing required fields');
    }

    const pool = await poolPromise;

    // Set the new order_id as '-'
    const newOrderId = '-';

    // Insert the new order
    await pool.request()
      .input('order_id', sql.VarChar, newOrderId)
      .input('product_id', sql.Int, product_id)
      .input('quantity', sql.Int, quantity)
      .input('order_date', sql.Date, order_date)
      .input('confirmed_quantity', sql.Int, 0)
      .query('INSERT INTO orders (order_id, product_id, quantity, order_date, confirmed_quantity) VALUES (@order_id, @product_id, @quantity, @order_date, @confirmed_quantity)');

    res.status(201).json({ message: 'Order placed successfully', order_id: newOrderId });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order: ' + err.message);
  }
});


app.get('/orders', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT o.id, o.product_id, o.quantity, o.order_date, o.confirmed_quantity, o.order_id, p.name AS product_name, p.image
      FROM orders o
      JOIN products p ON o.product_id = p.id;
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Error fetching orders: ' + err.message);
  }
});

app.get('/latest-order-id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT TOP 1 order_id FROM orders ORDER BY id DESC');
    
    const latestOrderId = result.recordset[0]?.order_id || '-';
    res.status(200).json({ latest_order_id: latestOrderId });
  } catch (err) {
    console.error('Error fetching latest order ID:', err.message);
    res.status(500).send('Error fetching latest order ID: ' + err.message);
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
