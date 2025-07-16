# 🚨 MANUAL DATABASE FUNCTION DEPLOYMENT REQUIRED

## The Problem
The PostgreSQL function `process_inventory_consumption` is not deployed to the Supabase database, causing verbruik registration to fail.

## Manual Solution (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/rlgnxmygytofqmhmgfaa/sql
2. Login with your Supabase account

### Step 2: Copy and Execute SQL
1. Copy the ENTIRE contents of the file: `supabase/deploy_consumption_function.sql`
2. Paste into the Supabase SQL Editor
3. Click "Run" to execute

### Step 3: Verify Function Deployment
After execution, you should see:
- `Function deployed successfully` message
- No errors in the output

### Step 4: Test the Application
1. Refresh the inventory page
2. Try to register verbruik for an item
3. Should work without "function not found" errors

## Alternative: Quick Fix for Development
If you can't access Supabase dashboard, I can create a simplified version that works with the current setup.

## What This Function Does
- Atomically updates inventory stock
- Logs consumption transactions
- Prevents race conditions
- Handles error cases gracefully

## Files to Deploy
- `supabase/deploy_consumption_function.sql` (main deployment script)
- Contains the full `process_inventory_consumption` function with all dependencies

## Expected Result
After deployment, the verbruik registration should work perfectly with proper error handling and atomic transactions.

---

**⚡ PRIORITY: This is blocking the entire consumption workflow!**