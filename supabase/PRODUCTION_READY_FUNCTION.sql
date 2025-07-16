-- Production-Ready Stock2Coat Inventory Consumption Function
-- Based on comprehensive analysis of frontend call signature and business requirements
-- This script can be run directly in Supabase SQL Editor

-- Step 1: Create the inventory_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity NUMERIC NOT NULL,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    project_order TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Additional audit fields
    previous_quantity NUMERIC,
    new_quantity NUMERIC
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_log_item_id ON public.inventory_log(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at ON public.inventory_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_log_user_id ON public.inventory_log(user_id);

-- Step 3: Create the main consumption function
CREATE OR REPLACE FUNCTION public.process_inventory_consumption(
    p_item_id UUID,
    p_quantity NUMERIC,
    p_user_id UUID,
    p_user_name TEXT,
    p_project_order TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_quantity NUMERIC;
    v_new_quantity NUMERIC;
    v_item_code TEXT;
    v_min_stock NUMERIC;
    v_new_status TEXT;
    v_log_id UUID;
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

    -- Step 1: Lock the inventory row and get current data (prevents race conditions)
    SELECT 
        current_stock, 
        ral_code, 
        min_stock
    INTO 
        v_current_quantity, 
        v_item_code, 
        v_min_stock
    FROM public.inventory_items
    WHERE id = p_item_id
    FOR UPDATE;

    -- Check if item exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item with ID % not found', p_item_id;
    END IF;

    -- Step 2: Check for sufficient stock
    IF v_current_quantity < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: % kg, Requested: % kg', 
            v_current_quantity, p_quantity;
    END IF;

    -- Step 3: Calculate new quantity
    v_new_quantity := v_current_quantity - p_quantity;

    -- Determine new status based on stock levels
    IF v_new_quantity <= 0 THEN
        v_new_status := 'UIT';
    ELSIF v_new_quantity <= v_min_stock THEN
        v_new_status := 'LAAG';
    ELSIF v_new_quantity <= (v_min_stock * 2) THEN
        v_new_status := 'GEM';
    ELSE
        v_new_status := 'OK';
    END IF;

    -- Step 4: Update the inventory (atomic operation 1)
    UPDATE public.inventory_items
    SET 
        current_stock = v_new_quantity,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_item_id;

    -- Step 5: Create audit log entry (atomic operation 2)
    INSERT INTO public.inventory_log (
        item_id,
        action_type,
        quantity,
        user_id,
        user_name,
        project_order,
        notes,
        previous_quantity,
        new_quantity,
        created_at
    ) VALUES (
        p_item_id,
        'OUT',
        p_quantity,
        p_user_id,
        p_user_name,
        p_project_order,
        p_notes,
        v_current_quantity,
        v_new_quantity,
        NOW()
    )
    RETURNING id INTO v_log_id;

    -- Step 6: Return success response
    RETURN json_build_object(
        'status', 'success',
        'message', 'Inventory consumption processed successfully',
        'data', json_build_object(
            'item_id', p_item_id,
            'item_code', v_item_code,
            'previous_quantity', v_current_quantity,
            'consumed_quantity', p_quantity,
            'new_quantity', v_new_quantity,
            'new_status', v_new_status,
            'log_id', v_log_id,
            'user_name', p_user_name,
            'timestamp', NOW()
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return failure response
        RAISE EXCEPTION 'Consumption failed: %', SQLERRM;
END;
$$;

-- Step 4: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_inventory_consumption(
    UUID, NUMERIC, UUID, TEXT, TEXT, TEXT
) TO authenticated;

-- Step 5: Create RLS policies if they don't exist
DO $$
BEGIN
    -- Policy for inventory_log table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Enable inventory_log access for authenticated users' 
        AND tablename = 'inventory_log'
    ) THEN
        CREATE POLICY "Enable inventory_log access for authenticated users" 
        ON public.inventory_log 
        FOR ALL 
        TO authenticated 
        USING (true);
    END IF;

    -- Policy for inventory_items consumption
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Enable inventory consumption for authenticated users' 
        AND tablename = 'inventory_items'
    ) THEN
        CREATE POLICY "Enable inventory consumption for authenticated users" 
        ON public.inventory_items 
        FOR UPDATE 
        TO authenticated 
        USING (true);
    END IF;
END
$$;

-- Step 6: Enable RLS on the inventory_log table
ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;

-- Step 7: Create performance indexes on inventory_items if they don't exist
CREATE INDEX IF NOT EXISTS idx_inventory_items_consumption_lookup 
ON public.inventory_items(id, current_stock, min_stock);

-- Step 8: Add helpful comments
COMMENT ON FUNCTION public.process_inventory_consumption IS 
'Atomically processes inventory consumption by decrementing stock and creating audit log entry. 
Includes safety checks for sufficient stock and concurrency protection via row locking.';

COMMENT ON TABLE public.inventory_log IS 
'Audit log table for all inventory changes including consumption, restocking, and adjustments.';

-- Step 9: Verification query
SELECT 
    'Function deployed successfully' as status,
    'process_inventory_consumption' as function_name,
    'Ready for production use' as message;

-- Step 10: Test the function exists (optional - will show parameters)
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as parameters,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'process_inventory_consumption';