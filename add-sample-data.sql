-- Add sample inventory items
INSERT INTO inventory_items (
  ral_code, color, brand, product_code, status, 
  current_stock, max_stock, min_stock, location, 
  unit, supplier, weight, cost_per_unit, description
) VALUES
  ('RAL1000', '#BEBD7F', 'Akzo Nobel', 'AN-1000-25', 'OK', 25.5, 50.0, 10.0, 'A1-001', 'kg', 'Akzo Nobel', 25.5, 8.50, 'Green beige powder coating'),
  ('RAL1001', '#C2B078', 'Akzo Nobel', 'AN-1001-15', 'GEM', 15.2, 40.0, 8.0, 'A1-002', 'kg', 'Akzo Nobel', 15.2, 8.75, 'Beige powder coating'),
  ('RAL1002', '#C6A664', 'Tiger', 'TG-1002-5', 'LAAG', 5.8, 30.0, 10.0, 'A1-003', 'kg', 'Tiger Coatings', 5.8, 9.20, 'Sand yellow powder coating'),
  ('RAL3020', '#CC0605', 'Akzo Nobel', 'AN-3020-30', 'OK', 30.0, 45.0, 12.0, 'B2-001', 'kg', 'Akzo Nobel', 30.0, 10.50, 'Traffic red powder coating'),
  ('RAL5015', '#2271B3', 'Tiger', 'TG-5015-20', 'OK', 20.3, 35.0, 8.0, 'B2-002', 'kg', 'Tiger Coatings', 20.3, 11.25, 'Sky blue powder coating'),
  ('RAL6018', '#57A639', 'Akzo Nobel', 'AN-6018-12', 'GEM', 12.5, 40.0, 10.0, 'C1-001', 'kg', 'Akzo Nobel', 12.5, 9.80, 'Yellow green powder coating'),
  ('RAL7016', '#383E42', 'Tiger', 'TG-7016-25', 'OK', 25.0, 50.0, 15.0, 'C1-002', 'kg', 'Tiger Coatings', 25.0, 8.90, 'Anthracite grey powder coating'),
  ('RAL9003', '#F4F4F4', 'Akzo Nobel', 'AN-9003-40', 'OK', 40.2, 60.0, 20.0, 'D1-001', 'kg', 'Akzo Nobel', 40.2, 7.50, 'Signal white powder coating'),
  ('RAL9005', '#0A0A0A', 'Tiger', 'TG-9005-8', 'LAAG', 8.1, 45.0, 12.0, 'D1-002', 'kg', 'Tiger Coatings', 8.1, 9.60, 'Jet black powder coating'),
  ('RAL9010', '#FFFFFF', 'Akzo Nobel', 'AN-9010-35', 'OK', 35.7, 55.0, 18.0, 'D1-003', 'kg', 'Akzo Nobel', 35.7, 7.25, 'Pure white powder coating');

-- Add some sample transactions
INSERT INTO transactions (
  inventory_item_id, type, quantity, user_name, order_number, notes
) VALUES
  ((SELECT id FROM inventory_items WHERE ral_code = 'RAL1000'), 'OUT', 5.0, 'Jan Janssen', 'ORD-2024-001', 'Used for customer order'),
  ((SELECT id FROM inventory_items WHERE ral_code = 'RAL3020'), 'OUT', 8.5, 'Piet Peters', 'ORD-2024-002', 'Emergency order fulfillment'),
  ((SELECT id FROM inventory_items WHERE ral_code = 'RAL9003'), 'IN', 20.0, 'Marie Dubois', 'PO-2024-003', 'Weekly stock replenishment'),
  ((SELECT id FROM inventory_items WHERE ral_code = 'RAL5015'), 'OUT', 3.2, 'Jan Janssen', 'ORD-2024-004', 'Small batch order'),
  ((SELECT id FROM inventory_items WHERE ral_code = 'RAL7016'), 'ADJUSTMENT', -2.5, 'System', NULL, 'Inventory correction after stocktake');