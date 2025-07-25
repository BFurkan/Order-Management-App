-- Supabase Database Schema for Order Management App
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
-- Note: For public projects, you might want to disable RLS for simplicity

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  confirmed_quantity INTEGER DEFAULT 0,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ordered_by VARCHAR(100) NOT NULL,
  comment TEXT,
  item_comment TEXT,
  serial_numbers TEXT,
  confirmed_items TEXT,
  confirm_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create confirmed_items table
CREATE TABLE IF NOT EXISTS confirmed_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  serial_number VARCHAR(255),
  item_comment TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deployed_items table
CREATE TABLE IF NOT EXISTS deployed_items (
  id SERIAL PRIMARY KEY,
  confirmed_item_id INTEGER NOT NULL,
  serial_number VARCHAR(255) NOT NULL,
  deployed_by VARCHAR(100) NOT NULL,
  deployment_location VARCHAR(255),
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_confirmed_items_serial ON confirmed_items(serial_number);
CREATE INDEX IF NOT EXISTS idx_deployed_items_serial ON deployed_items(serial_number);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Insert sample products
INSERT INTO products (name, category, price) VALUES 
('Lenovo ThinkPad X1 Carbon', 'Notebooks', 1299.99),
('Lenovo ThinkPad T14', 'Notebooks', 999.99),
('Lenovo IdeaPad 5', 'Notebooks', 699.99),
('Lenovo ThinkPad E14', 'Notebooks', 799.99),
('Lenovo ThinkPad L13 Yoga', 'Notebooks', 899.99),
('Lenovo ThinkCentre M90n', 'Desktops', 599.99),
('Lenovo ThinkPad X13', 'Notebooks', 1099.99),
('Lenovo ThinkPad P15', 'Workstations', 1899.99),
('Lenovo ThinkPad X1 Yoga', 'Notebooks', 1399.99),
('Lenovo ThinkPad T15', 'Notebooks', 1199.99)
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Optional for public projects
-- Uncomment the lines below if you want to enable RLS

-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE confirmed_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deployed_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (if RLS is enabled)
-- CREATE POLICY "Public access to products" ON products FOR ALL USING (true);
-- CREATE POLICY "Public access to orders" ON orders FOR ALL USING (true);
-- CREATE POLICY "Public access to confirmed_items" ON confirmed_items FOR ALL USING (true);
-- CREATE POLICY "Public access to deployed_items" ON deployed_items FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Enable real-time subscriptions (optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE products;
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE confirmed_items;
-- ALTER PUBLICATION supabase_realtime ADD TABLE deployed_items; 