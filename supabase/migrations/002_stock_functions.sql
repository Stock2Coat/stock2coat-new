-- Function to increment stock
CREATE OR REPLACE FUNCTION increment_stock(item_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE inventory_items 
  SET current_stock = current_stock + amount
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(item_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE inventory_items 
  SET current_stock = GREATEST(0, current_stock - amount)
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;