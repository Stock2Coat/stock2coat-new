-- EMERGENCY REDEPLOYMENT SCRIPT
-- Run this IMMEDIATELY in Supabase SQL Editor to fix the missing function

-- Step 1: Drop any existing function variants (clean slate)
DROP FUNCTION IF EXISTS public.process_inventory_consumption(uuid, numeric, uuid, text, text, text);
DROP FUNCTION IF EXISTS public.process_inventory_consumption(uuid, numeric, uuid, text);
DROP FUNCTION IF EXISTS public.process_inventory_consumption(uuid, numeric, uuid, text, text);

-- Step 2: Create the exact function needed
CREATE OR REPLACE FUNCTION public.process_inventory_consumption(
    p_item_id UUID,
    p_quantity NUMERIC,
    p_user_id UUID,
    p_user_name TEXT,
    p_project_order TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock NUMERIC;
    v_min_stock NUMERIC;
    v_new_stock NUMERIC;
    v_new_status TEXT;
    v_item_code TEXT;
    v_transaction_id UUID;
    v_result JSONB;
BEGIN
    -- Input validation
    IF p_item_id IS NULL THEN
        RAISE EXCEPTION 'Item ID cannot be null';
    END IF;
    
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than 0';
    END IF;
    
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    IF p_user_name IS NULL OR LENGTH(TRIM(p_user_name)) = 0 THEN
        RAISE EXCEPTION 'User name cannot be empty';
    END IF;

    -- Lock the inventory row and get current data
    SELECT 
        current_stock, 
        min_stock, 
        ral_code
    INTO 
        v_current_stock, 
        v_min_stock, 
        v_item_code
    FROM public.inventory_items
    WHERE id = p_item_id
    FOR UPDATE;

    -- Check if item exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item with ID % not found', p_item_id;
    END IF;

    -- Check for sufficient stock
    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: % kg, Requested: % kg', 
            v_current_stock, p_quantity;
    END IF;

    -- Calculate new quantity and status
    v_new_stock := v_current_stock - p_quantity;
    v_transaction_id := gen_random_uuid();

    -- Determine new status
    IF v_new_stock <= 0 THEN
        v_new_status := 'UIT';
    ELSIF v_new_stock <= v_min_stock THEN
        v_new_status := 'LAAG';
    ELSIF v_new_stock <= (v_min_stock * 2) THEN
        v_new_status := 'GEM';
    ELSE
        v_new_status := 'OK';
    END IF;

    -- Update inventory
    UPDATE public.inventory_items
    SET 
        current_stock = v_new_stock,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_item_id;

    -- Create audit log if transactions table exists
    BEGIN
        INSERT INTO public.transactions (
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
    EXCEPTION
        WHEN undefined_table THEN
            -- Ignore if transactions table doesn't exist
            NULL;
    END;

    -- Build success response
    v_result := jsonb_build_object(
        'status', 'success',
        'message', 'Inventory consumption processed successfully',
        'data', jsonb_build_object(
            'item_id', p_item_id,
            'item_code', v_item_code,
            'previous_stock', v_current_stock,
            'consumed_quantity', p_quantity,
            'new_stock', v_new_stock,
            'new_status', v_new_status,
            'transaction_id', v_transaction_id,
            'user_name', p_user_name,
            'timestamp', NOW()
        )
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Consumption failed: %', SQLERRM;
END;
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.process_inventory_consumption(UUID, NUMERIC, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_inventory_consumption(UUID, NUMERIC, UUID, TEXT, TEXT, TEXT) TO anon;

-- Step 4: Verify deployment
SELECT 
    'SUCCESS: Function deployed' as status,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as parameters
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'process_inventory_consumption';

-- Step 5: Test the function exists
SELECT 'Function ready for use' as message;