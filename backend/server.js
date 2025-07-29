import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3004;

// Smart Order ID Generation Function
// Always generates sequential numeric IDs regardless of existing order IDs
function generateNextOrderId(lastOrderId) {
  if (!lastOrderId) {
    return 1; // Start with 1 if no previous orders
  }

  // Convert to string to handle both cases
  const lastId = String(lastOrderId);
  
  // Check if the order ID is purely numeric
  if (/^\d+$/.test(lastId)) {
    // Pure number: increment normally
    return parseInt(lastId) + 1;
  }
  
  // If it's not numeric, find the highest numeric order ID in the database
  // This ensures we always increment from the highest numeric value
  return null; // Signal to the calling function to find the highest numeric ID
}

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'asset',
  password: process.env.DB_PASSWORD || 'Ontario2025$',
  database: process.env.DB_NAME || 'order_management',
  port: 3306,
  connectionLimit: 10,
  queueLimit: 0,
});

// Setup CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
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

app.use('/images', express.static(imagesDir));

// Database connection test middleware
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

// Routes
app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products');
  }
});

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
    res.status(500).send('Error fetching product');
  }
});

app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const productPrice = parseFloat(price) || 0.00;
    await pool.query('INSERT INTO products (name, category, price, image) VALUES (?, ?, ?, ?)', [name, category, productPrice, image]);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).send('Error adding product');
  }
});

app.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;
    const productPrice = parseFloat(price) || 0.00;
    
    // Check if a new image was uploaded
    if (req.file) {
      const image = `/images/${req.file.filename}`;
      await pool.query(
        'UPDATE products SET name = ?, category = ?, price = ?, image = ? WHERE id = ?', 
        [name, category, productPrice, image, id]
      );
    } else {
      // Update without changing the image
      await pool.query(
        'UPDATE products SET name = ?, category = ?, price = ? WHERE id = ?', 
        [name, category, productPrice, id]
      );
    }
    
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Error updating product');
  }
});

app.get('/latest-order-id', async (req, res) => {
  try {
    // For purely numeric order IDs, get the maximum numeric value
    // For mixed patterns, we'll get all and find the highest programmatically
    const [allOrderIds] = await pool.query('SELECT DISTINCT order_id FROM orders WHERE order_id IS NOT NULL ORDER BY order_id');
    
    if (allOrderIds.length === 0) {
      return res.status(200).json({ latest_order_id: 0 });
    }
    
    let latestOrderId = null;
    let maxNumericValue = 0;
    
    // Check if all order IDs are purely numeric
    const allNumeric = allOrderIds.every(row => /^\d+$/.test(row.order_id));
    
    if (allNumeric) {
      // All are numeric - find the maximum numeric value
      maxNumericValue = Math.max(...allOrderIds.map(row => parseInt(row.order_id)));
      latestOrderId = maxNumericValue.toString();
    } else {
      // Mixed or alphanumeric patterns - use the last one alphabetically
      latestOrderId = allOrderIds[allOrderIds.length - 1].order_id;
    }
    
    console.log('Latest Order ID found:', latestOrderId);
    res.status(200).json({ latest_order_id: latestOrderId });
  } catch (err) {
    console.error('Error fetching latest order ID:', err.message);
    res.status(500).send('Error fetching latest order ID');
  }
});

// New bulk order endpoint to keep items together
app.post('/bulk-orders', async (req, res) => {
  try {
    const { items, order_date } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0 || !order_date) {
      return res.status(400).send('Missing required fields');
    }

    // Parse the date string (YYYY-MM-DD format) to a Date object
    // Add time component to make it a valid datetime for MySQL
    const parsedOrderDate = order_date;
    if (!parsedOrderDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedOrderDate)) {
      return res.status(400).send('Invalid date format. Expected YYYY-MM-DD');
    }

    // Generate a new order ID for this bulk order
    const [allOrderIds] = await pool.query('SELECT DISTINCT order_id FROM orders WHERE order_id IS NOT NULL');
    
    let nextOrderId = 1; // Default to 1 if no previous orders
    if (allOrderIds.length > 0) {
      // Find the highest numeric order ID
      const numericOrderIds = allOrderIds
        .map(row => row.order_id)
        .filter(id => /^\d+$/.test(String(id)))
        .map(id => parseInt(id));
      
      if (numericOrderIds.length > 0) {
        const maxNumericValue = Math.max(...numericOrderIds);
        nextOrderId = maxNumericValue + 1;
      }
    }

    // Insert all items with the same order ID
    const insertPromises = items.map(item => {
      return pool.query(
        'INSERT INTO orders (product_id, quantity, order_date, confirmed_quantity, order_id, ordered_by) VALUES (?, ?, ?, 0, ?, NULL)',
        [item.product_id, item.quantity, parsedOrderDate, nextOrderId]
      );
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: 'Bulk order placed successfully', order_id: nextOrderId });
  } catch (err) {
    console.error('Error placing bulk order:', err.message);
    res.status(500).send('Error placing bulk order');
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date, order_id } = req.body;
    if (!product_id || !quantity || !order_date) {
      return res.status(400).send('Missing required fields');
    }

    // Parse the date string (YYYY-MM-DD format) to a Date object
    // Add time component to make it a valid datetime for MySQL
    const parsedOrderDate = order_date;
    if (!parsedOrderDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedOrderDate)) {
      return res.status(400).send('Invalid date format. Expected YYYY-MM-DD');
    }

    let newOrderId = order_id;
    if (!newOrderId) {
      // Generate a new order ID for this order
      const [allOrderIds] = await pool.query('SELECT DISTINCT order_id FROM orders WHERE order_id IS NOT NULL');
      
      newOrderId = 1; // Default to 1 if no previous orders
      if (allOrderIds.length > 0) {
        // Find the highest numeric order ID
        const numericOrderIds = allOrderIds
          .map(row => row.order_id)
          .filter(id => /^\d+$/.test(String(id)))
          .map(id => parseInt(id));
        
        if (numericOrderIds.length > 0) {
          const maxNumericValue = Math.max(...numericOrderIds);
          newOrderId = maxNumericValue + 1;
        }
      }
    }

    const [result] = await pool.query(
      'INSERT INTO orders (product_id, quantity, order_date, confirmed_quantity, order_id, ordered_by) VALUES (?, ?, ?, 0, ?, NULL)',
      [product_id, quantity, parsedOrderDate, newOrderId]
    );

    res.status(201).json({ message: 'Order placed successfully', order_id: newOrderId });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order');
  }
});

app.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.product_id, o.quantity, o.order_date, o.confirmed_quantity, o.order_id, o.comment, o.item_comment, o.ordered_by, p.name AS product_name, p.image
      FROM orders o
      JOIN products p ON o.product_id = p.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Error fetching orders');
  }
});

app.post('/confirm', async (req, res) => {
  try {
    const { order_id, product_id, serialNumber } = req.body;
    const confirmQuantity = 1;

    const [rows] = await pool.query(
      'SELECT quantity, confirmed_quantity, serial_numbers FROM orders WHERE order_id = ? AND product_id = ?',
      [order_id, product_id]
    );

    if (rows.length === 0) return res.status(404).send('Order not found');

    const currentQuantity = rows[0].quantity;
    const currentConfirmedQuantity = rows[0].confirmed_quantity;

    if (currentQuantity <= 0) {
      return res.status(400).send('Cannot confirm more than available quantity');
    }

    const newConfirmedQuantity = currentConfirmedQuantity + confirmQuantity;
    const newTotalQuantity = currentQuantity - confirmQuantity;
    const updatedSerialNumbers = rows[0].serial_numbers
      ? JSON.parse(rows[0].serial_numbers)
      : [];

    updatedSerialNumbers.push(serialNumber);

    await pool.query(
      'UPDATE orders SET confirmed_quantity = ?, quantity = ?, confirm_date = ?, serial_numbers = ? WHERE order_id = ? AND product_id = ?',
      [
        newConfirmedQuantity,
        newTotalQuantity,
        new Date(),
        JSON.stringify(updatedSerialNumbers),
        order_id,
        product_id,
      ]
    );

    res.status(200).json({ message: 'Order confirmed successfully' });
  } catch (err) {
    console.error('Error confirming order:', err.message);
    res.status(500).send('Error confirming order');
  }
});

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
    res.status(500).send('Error updating order ID');
  }
});

app.get('/confirmed-items', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, p.name AS product_name, p.image, o.confirmed_quantity, o.order_date, o.confirm_date, o.order_id, o.comment, o.item_comment, o.ordered_by, o.serial_numbers, o.product_id
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.confirmed_quantity > 0
    `);
    
    console.log('Raw database rows:', rows.length > 0 ? rows[0] : 'No data');
    
    // Get all deployed items to filter them out
    const [deployedItems] = await pool.query(`
      SELECT original_order_id, serial_number FROM deployed_items
    `);
    
    console.log('Deployed items for filtering:', deployedItems.length);
    
    // Create a Set of deployed item identifiers for fast lookup
    const deployedSet = new Set();
    deployedItems.forEach(item => {
      console.log(`Adding to deployed set: ${item.original_order_id}-${item.serial_number}`);
      deployedSet.add(`${item.original_order_id}-${item.serial_number}`);
    });
    
    // Expand each confirmed item to show individual serial numbers
    const expandedItems = [];
    rows.forEach(row => {
      const serialNumbers = row.serial_numbers ? JSON.parse(row.serial_numbers) : [];
      
      // Create one entry for each confirmed item with its serial number
      for (let i = 0; i < row.confirmed_quantity; i++) {
        const serialNumber = serialNumbers[i] || 'N/A';
        const itemIdentifier = `${row.id}-${serialNumber}`;
        
        // Skip this item if it's already deployed
        if (deployedSet.has(itemIdentifier)) {
          console.log(`Skipping deployed item: ${itemIdentifier}`);
          continue;
        }
        
        const expandedItem = {
          id: `${row.id}-${i}`, // Unique ID for each individual item
          original_id: row.id,
          product_id: row.product_id,
          product_name: row.product_name,
          image: row.image, // Include product image from products table
          quantity: 1, // Each individual item has quantity 1
          order_date: row.order_date,
          confirm_date: row.confirm_date,
          confirmed_date: row.confirm_date, // Also include as confirmed_date for consistency
          order_id: row.order_id,
          comment: row.comment, // Order-level comment
          item_comment: row.item_comment, // Item-level comment from orders table
          ordered_by: row.ordered_by,
          serial_number: serialNumber // Get the specific serial number
        };
        
        console.log(`Expanded item ${i}:`, {
          id: expandedItem.id,
          image: expandedItem.image,
          item_comment: expandedItem.item_comment
        });
        
        expandedItems.push(expandedItem);
      }
    });
    
    console.log('Total expanded items (excluding deployed):', expandedItems.length);
    
    res.json(expandedItems);
  } catch (err) {
    console.error('Error fetching confirmed items:', err.message);
    res.status(500).send('Error fetching confirmed items');
  }
});

// PUT endpoint to update confirmed items
app.put('/confirmed-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Parse the ID to get the original order ID and item index
    const [orderId, itemIndex] = id.split('-').map(Number);
    
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Get the current order data
    const [currentOrder] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (currentOrder.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = currentOrder[0];
    
    // Update the order with new data
    const updateFields = [];
    const updateValues = [];
    
    // Map frontend field names to database column names
    if (updateData.product_name !== undefined) {
      // Note: product_name comes from products table, so we can't update it here
      // We would need to update the product_id if we want to change the product
    }
    
    if (updateData.quantity !== undefined) {
      updateFields.push('confirmed_quantity = ?');
      updateValues.push(updateData.quantity);
    }
    
    if (updateData.item_comment !== undefined) {
      updateFields.push('item_comment = ?');
      updateValues.push(updateData.item_comment);
    }
    
    if (updateData.order_date !== undefined) {
      updateFields.push('order_date = ?');
      updateValues.push(updateData.order_date);
    }
    
    if (updateData.confirm_date !== undefined) {
      updateFields.push('confirm_date = ?');
      updateValues.push(updateData.confirm_date);
    }
    
    if (updateData.ordered_by !== undefined) {
      updateFields.push('ordered_by = ?');
      updateValues.push(updateData.ordered_by);
    }
    
    // Update serial numbers if provided
    if (updateData.serial_number !== undefined) {
      const currentSerialNumbers = order.serial_numbers ? JSON.parse(order.serial_numbers) : [];
      if (currentSerialNumbers[itemIndex] !== undefined) {
        currentSerialNumbers[itemIndex] = updateData.serial_number;
        updateFields.push('serial_numbers = ?');
        updateValues.push(JSON.stringify(currentSerialNumbers));
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    updateValues.push(orderId);
    
    const [result] = await pool.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Item updated successfully' });
    } else {
      res.status(404).json({ message: 'Item not found or no changes made' });
    }
  } catch (err) {
    console.error('Error updating confirmed item:', err.message);
    res.status(500).send('Error updating confirmed item');
  }
});

// DELETE endpoint to delete confirmed items
app.delete('/confirmed-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse the ID to get the original order ID and item index
    const [orderId, itemIndex] = id.split('-').map(Number);
    
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    // Get the current order data
    const [currentOrder] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (currentOrder.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = currentOrder[0];
    
    // If this is the last confirmed item, we can delete the entire order
    if (order.confirmed_quantity === 1) {
      const [result] = await pool.query(
        'DELETE FROM orders WHERE id = ?',
        [orderId]
      );
      
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Item deleted successfully' });
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } else {
      // If there are multiple confirmed items, we need to:
      // 1. Decrease the confirmed_quantity
      // 2. Remove the specific serial number from the array
      const currentSerialNumbers = order.serial_numbers ? JSON.parse(order.serial_numbers) : [];
      
      if (currentSerialNumbers[itemIndex] !== undefined) {
        // Remove the specific serial number
        currentSerialNumbers.splice(itemIndex, 1);
        
        // Update the order
        const [result] = await pool.query(
          'UPDATE orders SET confirmed_quantity = ?, serial_numbers = ? WHERE id = ?',
          [order.confirmed_quantity - 1, JSON.stringify(currentSerialNumbers), orderId]
        );
        
        if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Item deleted successfully' });
        } else {
          res.status(404).json({ message: 'Item not found' });
        }
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    }
  } catch (err) {
    console.error('Error deleting confirmed item:', err.message);
    res.status(500).send('Error deleting confirmed item');
  }
});

app.post('/update-order-comment', async (req, res) => {
  try {
    const { orderId, comment } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const [result] = await pool.query(
      'UPDATE orders SET comment = ? WHERE order_id = ?',
      [comment || null, orderId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Comment updated successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).send('Error updating comment');
  }
});

app.post('/update-product-comment', async (req, res) => {
  try {
    const { orderId, productId, comment } = req.body;
    
    if (!orderId || !productId) {
      return res.status(400).json({ message: 'Order ID and Product ID are required' });
    }

    const [result] = await pool.query(
      'UPDATE orders SET item_comment = ? WHERE order_id = ? AND product_id = ?',
      [comment || null, orderId, productId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Product comment updated successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    console.error('Error updating product comment:', err.message);
    res.status(500).send('Error updating product comment');
  }
});

// Deploy item endpoint
app.post('/deploy-item', async (req, res) => {
  try {
    const { itemId, originalId, productId, orderId, serialNumber, deployDate } = req.body;
    
    console.log('Deploy request received:', { itemId, originalId, productId, orderId, serialNumber, deployDate });
    
    if (!originalId || !serialNumber) {
      return res.status(400).json({ message: 'Original ID and Serial Number are required' });
    }

    // Check if item is already deployed
    const [existingDeployment] = await pool.query(
      'SELECT id FROM deployed_items WHERE original_order_id = ? AND serial_number = ?',
      [originalId, serialNumber]
    );

    if (existingDeployment.length > 0) {
      return res.status(400).json({ message: 'Item is already deployed' });
    }

    // Get the item details from confirmed items (via orders table)
    const [orderRows] = await pool.query(`
      SELECT o.id, o.product_id, o.order_id, o.order_date, o.confirm_date, o.comment, o.item_comment, o.ordered_by, p.name AS product_name, p.image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [originalId]);

    console.log('Order lookup result:', orderRows.length > 0 ? 'Found' : 'Not found', orderRows[0]);

    if (orderRows.length === 0) {
      return res.status(404).json({ message: `Original order not found for ID: ${originalId}` });
    }

    const orderData = orderRows[0];

    // Format deploy_date for MySQL (convert from ISO string to MySQL datetime format)
    const formattedDeployDate = new Date(deployDate).toISOString().slice(0, 19).replace('T', ' ');
    
    // Insert into deployed_items table
    const [result] = await pool.query(
      `INSERT INTO deployed_items 
       (original_order_id, product_id, product_name, image, order_id, order_date, confirm_date, deploy_date, comment, item_comment, ordered_by, serial_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        originalId,
        orderData.product_id,
        orderData.product_name,
        orderData.image,
        orderData.order_id,
        orderData.order_date,
        orderData.confirm_date,
        formattedDeployDate,
        orderData.comment,
        orderData.item_comment,
        orderData.ordered_by,
        serialNumber
      ]
    );

    console.log('Insert result:', result);

    if (result.affectedRows > 0) {
      console.log('Item deployed successfully:', {
        originalId,
        serialNumber,
        identifier: `${originalId}-${serialNumber}`
      });
      
      // Check if this was the last item in the order
      const [remainingItems] = await pool.query(
        'SELECT confirmed_quantity FROM orders WHERE id = ?',
        [originalId]
      );
      
      if (remainingItems.length > 0) {
        const remainingQuantity = remainingItems[0].confirmed_quantity;
        
        // If no more confirmed items, we could optionally delete the order
        // For now, we'll just leave it as is since it might have other unconfirmed items
        console.log(`Order ${originalId} has ${remainingQuantity} remaining confirmed items`);
      }
      
      res.status(200).json({ success: true, message: 'Item deployed successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to deploy item' });
    }
  } catch (err) {
    console.error('Error deploying item:', err.message);
    console.error('Error stack:', err.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Error deploying item';
    if (err.message.includes('Incorrect integer value')) {
      errorMessage = 'Database schema mismatch. Please run the migration script to fix order_id column type.';
    } else if (err.message.includes('already deployed')) {
      errorMessage = 'This item is already deployed.';
    } else {
      errorMessage = 'Error deploying item: ' + err.message;
    }
    
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// Get deployed items endpoint
app.get('/deployed-items', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM deployed_items ORDER BY deploy_date DESC
    `);
    
    console.log('Deployed items found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching deployed items:', err.message);
    res.status(500).send('Error fetching deployed items');
  }
});

// Undeploy item endpoint
app.post('/undeploy-item', async (req, res) => {
  try {
    const { itemId, originalId, serialNumber } = req.body;
    
    if (!serialNumber) {
      return res.status(400).json({ message: 'Serial Number is required' });
    }

    const [result] = await pool.query(
      'DELETE FROM deployed_items WHERE serial_number = ?',
      [serialNumber]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Item undeployed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Deployed item not found' });
    }
  } catch (err) {
    console.error('Error undeploying item:', err.message);
    res.status(500).json({ success: false, message: 'Error undeploying item' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});
