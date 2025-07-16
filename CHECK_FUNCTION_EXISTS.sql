-- Check if the function exists in the database
-- Run this in Supabase SQL Editor to verify function status

-- Step 1: Check if function exists at all
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as parameters,
    pg_get_function_result(p.oid) as return_type,
    p.provolatile as volatility,
    p.prosecdef as security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'process_inventory_consumption';

-- Step 2: Check all functions with similar names
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as parameters
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname LIKE '%consumption%';

-- Step 3: Check permissions
SELECT 
    p.proname,
    p.proacl
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'process_inventory_consumption';

-- Step 4: If function doesn't exist, this will show what needs to be created
SELECT 
    'Function does not exist - needs deployment' as status,
    'Use PRODUCTION_READY_FUNCTION.sql to deploy' as action
WHERE NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'process_inventory_consumption'
);