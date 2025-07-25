# Supabase Setup Guide

This guide explains how to set up the Order Management System using Supabase as the database instead of MySQL.

## Why Supabase?

Supabase provides:
- ✅ Free PostgreSQL database hosting
- ✅ Real-time subscriptions
- ✅ Built-in authentication
- ✅ RESTful API
- ✅ No server maintenance required
- ✅ Suitable for public GitHub projects

## Setup Steps

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Note down your project URL and API keys

### 2. Database Schema Setup

In your Supabase dashboard, go to the SQL Editor and run:

```sql
-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table  
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  confirmed_quantity INTEGER DEFAULT 0,
  order_date TIMESTAMP NOT NULL,
  ordered_by VARCHAR(100) NOT NULL,
  comment TEXT,
  item_comment TEXT,
  serial_numbers TEXT,
  confirmed_items TEXT,
  confirm_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample products
INSERT INTO products (name, category) VALUES 
('Dell Monitor 24"', 'Monitors'),
('HP Laptop', 'Notebooks'),
('Wireless Mouse', 'Accessories');
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Server Configuration
PORT=3007
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Backend Code Changes

#### Install Supabase Client
```bash
cd backend
npm install @supabase/supabase-js
```

#### Update server.js

Replace the MySQL connection code with Supabase:

```javascript
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Example: Get products endpoint
app.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Error fetching products');
  }
});

// Example: Create order endpoint
app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity, order_date, order_id, ordered_by } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        product_id,
        quantity,
        order_date,
        order_id,
        ordered_by,
        confirmed_quantity: 0
      }]);
    
    if (error) throw error;
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Error placing order');
  }
});
```

### 5. Row Level Security (RLS)

For production, enable RLS in Supabase:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Public access to products" ON products FOR ALL USING (true);
CREATE POLICY "Public access to orders" ON orders FOR ALL USING (true);
```

### 6. Real-time Features (Optional)

Supabase supports real-time updates:

```javascript
// Frontend: Listen to order changes
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order updated:', payload);
      // Update UI accordingly
    }
  )
  .subscribe();
```

## Migration from MySQL

If you're migrating from MySQL:

### 1. Export Existing Data
```bash
mysqldump -u username -p inventory_system > backup.sql
```

### 2. Convert to PostgreSQL Format
- Change `AUTO_INCREMENT` to `SERIAL`
- Update data types as needed
- Adjust syntax differences

### 3. Import to Supabase
Use the Supabase dashboard SQL editor to import your data.

## Advantages of Supabase

### For Development
- No local database setup required
- Automatic backups
- Built-in database browser
- API automatically generated

### For Production
- Scales automatically
- Global CDN
- Real-time capabilities
- Built-in authentication ready

### For Public Projects
- No sensitive database credentials in code
- Easy for others to set up their own instance
- Professional cloud infrastructure

## Environment Variables Summary

### Required Environment Variables
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
```

### Finding Your Keys
1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings > API
4. Copy the URL and keys

## Security Best Practices

### 1. Use Service Key for Server-Side
- Never expose service key in frontend
- Use anon key for frontend operations
- Enable RLS for data protection

### 2. Environment Variables
- Never commit `.env` files
- Use different keys for development/production
- Rotate keys periodically

### 3. Database Policies
```sql
-- Example: Only authenticated users can modify orders
CREATE POLICY "Authenticated users can modify orders" 
ON orders FOR ALL 
USING (auth.role() = 'authenticated');
```

## Troubleshooting

### Common Issues

#### "Invalid API Key"
- Check your environment variables
- Verify key format is correct
- Ensure using correct key type (anon vs service)

#### "Table doesn't exist"
- Run the schema creation SQL
- Check table names match exactly
- Verify connection to correct project

#### "RLS Policy Violation"
- Disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Create appropriate policies
- Use service key for server operations

### Getting Help
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

*This setup provides a robust, scalable alternative to traditional MySQL hosting and is perfect for open-source projects.* 