-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS price_changes CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  category VARCHAR,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  description TEXT,
  image_url VARCHAR,
  sku VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_logs table
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_stock INTEGER,
  new_stock INTEGER,
  change_amount INTEGER,
  reason VARCHAR,
  notes TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR
);

-- Create price_changes table
CREATE TABLE price_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2),
  reason VARCHAR,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR
);

-- Create activity_logs table (for general activity tracking)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR,
  action VARCHAR NOT NULL,
  table_name VARCHAR,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_changed_at ON inventory_logs(changed_at);
CREATE INDEX idx_price_changes_product_id ON price_changes(product_id);
CREATE INDEX idx_price_changes_changed_at ON price_changes(changed_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Insert sample products
INSERT INTO products (barcode, name, category, price, cost, stock, min_stock, sku, description)
VALUES
  ('555555555', 'Orange Juice 2L', 'Beverages', 5.99, 2.50, 15, 5, 'OJ-001', 'Fresh orange juice 2 liter bottle'),
  ('666666666', 'Milk 1L', 'Dairy', 3.49, 1.50, 20, 10, 'MK-001', 'Whole milk 1 liter'),
  ('777777777', 'Bread Loaf', 'Bakery', 2.99, 1.00, 10, 3, 'BR-001', 'Whole wheat bread'),
  ('888888888', 'Eggs (12 pack)', 'Dairy', 4.99, 2.00, 8, 3, 'EG-001', 'Grade A large eggs'),
  ('999999999', 'Apples (1kg)', 'Produce', 3.99, 1.75, 25, 5, 'AP-001', 'Fresh red apples');

-- Disable RLS on all tables (allows anon key access)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
