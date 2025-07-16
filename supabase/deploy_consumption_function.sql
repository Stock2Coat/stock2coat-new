-- Deploy this SQL script manually in the Supabase SQL Editor
-- This creates the atomic consumption function that the application needs

-- Drop function if it exists (for updates)
DROP FUNCTION IF EXISTS process_inventory_consumption;

-- Create the atomic consumption function
CREATE OR REPLACE FUNCTION process_inventory_consumption(
    p_item_id UUID,
    p_quantity NUMERIC,
    p_user_id UUID,
    p_user_name TEXT,
    p_project_order TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_current_stock NUMERIC;
    v_min_stock NUMERIC;
    v_new_stock NUMERIC;
    v_new_status TEXT;
    v_item_code TEXT;
    v_transaction_id UUID;
    v_result JSONB;
BEGIN
    -- Lock the inventory item to prevent concurrent modifications
    SELECT current_stock, min_stock, ral_code
    INTO v_current_stock, v_min_stock, v_item_code
    FROM inventory_items
    WHERE id = p_item_id
    FOR UPDATE;
    
    -- Check if item exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ITEM_NOT_FOUND',
            'message', 'Inventory item not found'
        );
    END IF;
    
    -- Validate consumption quantity
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INVALID_QUANTITY',
            'message', 'Consumption quantity must be greater than 0'
        );
    END IF;
    
    -- Check if sufficient stock is available
    IF v_current_stock < p_quantity THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INSUFFICIENT_STOCK',
            'message', format('Insufficient stock. Available: %s kg, Requested: %s kg', v_current_stock, p_quantity),
            'available_stock', v_current_stock,
            'requested_quantity', p_quantity
        );
    END IF;
    
    -- Calculate new stock level
    v_new_stock := v_current_stock - p_quantity;
    
    -- Determine new status based on stock level
    IF v_new_stock <= 0 THEN
        v_new_status := 'UIT';
    ELSIF v_new_stock <= v_min_stock THEN
        v_new_status := 'LAAG';
    ELSIF v_new_stock <= (v_min_stock * 2) THEN
        v_new_status := 'GEM';
    ELSE
        v_new_status := 'OK';
    END IF;
    
    -- Generate transaction ID
    v_transaction_id := gen_random_uuid();
    
    -- Update inventory item (atomic operation 1)
    UPDATE inventory_items
    SET 
        current_stock = v_new_stock,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Log the transaction (atomic operation 2)
    INSERT INTO transactions (
        id,
        inventory_item_id,
        type,
        quantity,
        user_name,
        order_number,
        notes,
        created_at
    ) VALUES (
        v_transaction_id,
        p_item_id,
        'OUT',
        p_quantity,
        p_user_name,
        p_project_order,
        p_notes,
        NOW()
    );
    
    -- Build success response
    v_result := jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'item_id', p_item_id,
        'item_code', v_item_code,
        'previous_stock', v_current_stock,
        'consumed_quantity', p_quantity,
        'new_stock', v_new_stock,
        'new_status', v_new_status,
        'user_name', p_user_name,
        'project_order', p_project_order,
        'timestamp', NOW()
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return failure response
        RETURN jsonb_build_object(
            'success', false,
            'error', 'TRANSACTION_FAILED',
            'message', format('Transaction failed: %s', SQLERRM),
            'sql_state', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_inventory_consumption TO authenticated;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock_lookup 
ON inventory_items(id, current_stock, min_stock);

CREATE INDEX IF NOT EXISTS idx_transactions_item_date 
ON transactions(inventory_item_id, created_at DESC);

-- Test the function (optional - can be removed in production)
SELECT 'Function deployed successfully' as status;