import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3007;

// Smart Order ID Generation Function
function generateNextOrderId(lastOrderId) {
  if (!lastOrderId) {
    return 1;
  }

  const lastId = String(lastOrderId);
  
  if (/^\d+$/.test(lastId)) {
    return parseInt(lastId) + 1;
  }
  
  const match = lastId.match(/^([A-Za-z]*)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const number = parseInt(match[2]);
    const paddingLength = match[2].length;
    const nextNumber = number + 1;
    return prefix + nextNumber.toString().padStart(paddingLength, '0');
  }
  
  return `ORD${Date.now().toString().slice(-6)}`;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Setup CORS and JSON parsing
app.use(cors({
  origin: [
    'http://localhost:3008',
    'https://bfurkan.github.io',
    'https://bfurkan.github.io/Order-Management-App'
  ],
  credentials: true
}));
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
    // Test Supabase connection
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) throw error;
    next();
  } catch (err) {
    console.error('Supabase connection error:', err);
    res.status(500).send('Database connection error');
  }
});

// Routes
app.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products');
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).send('Product not found');
    }
    res.json(data);
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
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        category,
        price: productPrice,
        image
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json({ message: 'Product added successfully', data: data[0] });
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
    
    let updateData = { name, category, price: productPrice };
    
    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json({ message: 'Product updated successfully', data: data[0] });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Error updating product');
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).send('Error deleting product');
  }
});

// Orders endpoints
app.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          name,
          category,
          image
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Error fetching orders');
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date, order_id, ordered_by, comment } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_id,
        product_id,
        quantity,
        order_date,
        ordered_by,
        comment,
        confirmed_quantity: 0
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json({ message: 'Order placed successfully', data: data[0] });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order');
  }
});

app.put('/update-order-comment', async (req, res) => {
  try {
    const { order_id, comment } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ comment })
      .eq('order_id', order_id)
      .select();
    
    if (error) throw error;
    res.json({ message: 'Comment updated successfully', data: data[0] });
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).send('Error updating comment');
  }
});

// Confirmed items endpoints
app.get('/confirmed-items', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('confirmed_items')
      .select(`
        *,
        orders (
          order_id,
          ordered_by,
          comment
        ),
        products (
          name,
          category
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching confirmed items:', err.message);
    res.status(500).send('Error fetching confirmed items');
  }
});

app.post('/confirm', async (req, res) => {
  try {
    const { order_id, product_id, serial_numbers, item_comment, confirmed_items } = req.body;
    
    // Insert confirmed items
    const confirmedItemsData = confirmed_items.map(item => ({
      order_id,
      product_id,
      serial_number: serial_numbers[item] || '',
      item_comment: item_comment[item] || '',
      confirmed_at: new Date().toISOString()
    }));
    
    const { error: confirmError } = await supabase
      .from('confirmed_items')
      .insert(confirmedItemsData);
    
    if (confirmError) throw confirmError;
    
    // Update order confirmed quantity
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        confirmed_quantity: confirmed_items.length,
        item_comment: JSON.stringify(item_comment),
        serial_numbers: JSON.stringify(serial_numbers),
        confirmed_items: JSON.stringify(confirmed_items),
        confirm_date: new Date().toISOString()
      })
      .eq('order_id', order_id)
      .eq('product_id', product_id);
    
    if (updateError) throw updateError;
    
    res.json({ message: 'Items confirmed successfully' });
  } catch (err) {
    console.error('Error confirming items:', err.message);
    res.status(500).send('Error confirming items');
  }
});

// Deployed items endpoints
app.get('/deployed-items', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deployed_items')
      .select(`
        *,
        confirmed_items (
          serial_number,
          item_comment,
          orders (
            order_id,
            ordered_by
          ),
          products (
            name,
            category
          )
        )
      `)
      .order('deployed_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching deployed items:', err.message);
    res.status(500).send('Error fetching deployed items');
  }
});

app.post('/deploy-item', async (req, res) => {
  try {
    const { confirmed_item_id, deployed_by, deployment_location } = req.body;
    
    // Get confirmed item details
    const { data: confirmedItem, error: fetchError } = await supabase
      .from('confirmed_items')
      .select('*')
      .eq('id', confirmed_item_id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Insert deployed item
    const { error: deployError } = await supabase
      .from('deployed_items')
      .insert([{
        confirmed_item_id,
        serial_number: confirmedItem.serial_number,
        deployed_by,
        deployment_location,
        deployed_at: new Date().toISOString()
      }]);
    
    if (deployError) throw deployError;
    
    // Delete from confirmed items
    const { error: deleteError } = await supabase
      .from('confirmed_items')
      .delete()
      .eq('id', confirmed_item_id);
    
    if (deleteError) throw deleteError;
    
    res.json({ message: 'Item deployed successfully' });
  } catch (err) {
    console.error('Error deploying item:', err.message);
    res.status(500).send('Error deploying item');
  }
});

// Search confirmed items by serial number
app.get('/search-confirmed/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    const { data, error } = await supabase
      .from('confirmed_items')
      .select(`
        *,
        orders (
          order_id,
          ordered_by,
          comment
        ),
        products (
          name,
          category
        )
      `)
      .eq('serial_number', serialNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Item not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error searching confirmed item:', err.message);
    res.status(500).send('Error searching confirmed item');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Supabase'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Database: Supabase`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 