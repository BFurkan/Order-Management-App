-- This script inserts a set of sample products into your database.
-- IMPORTANT: Make sure you have uploaded the corresponding image files to your "product-images" bucket in Supabase Storage before running this.

INSERT INTO public.products (name, category, price, image) VALUES
('Lenovo ThinkPad T14', 'Notebooks', 1450.00, 'lenovo_thinkpad.jpg'),
('Dell UltraSharp U2721DE', 'Monitors', 650.50, 'dell_ultrasharp.jpg'),
('Logitech MX Master 3', 'Accessories', 99.99, 'logitech_mx_master.jpg'),
('Apple MacBook Pro 16"', 'Notebooks', 2399.00, 'apple_macbook_pro.jpg');


