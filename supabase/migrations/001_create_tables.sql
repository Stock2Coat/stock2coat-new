-- Create inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ral_code VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  product_code VARCHAR(50) NOT NULL,
  status VARCHAR(10) CHECK (status IN ('OK', 'GEM', 'LAAG')) NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_stock DECIMAL(10,2) NOT NULL,
  min_stock DECIMAL(10,2) NOT NULL,
  location VARCHAR(50) NOT NULL,
  unit VARCHAR(10) NOT NULL DEFAULT 'kg',
  supplier VARCHAR(100) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  order_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_ral_code ON inventory_items(ral_code);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_transactions_inventory_item_id ON transactions(inventory_item_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (temporarily allow all for development)
CREATE POLICY "Allow all operations for authenticated users" ON inventory_items
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON transactions
  FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for inventory_items
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE
  ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();