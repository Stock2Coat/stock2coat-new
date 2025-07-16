# Deployment Guide: Atomic Consumption Function

## Issue
The `process_inventory_consumption` function is not found in the database schema, causing the verbruik (consumption) functionality to fail.

## Solution
The PostgreSQL function needs to be manually deployed to the Supabase database.

## Steps to Deploy

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the "SQL Editor" tab

2. **Execute the Deployment Script**
   - Copy the contents of `supabase/deploy_consumption_function.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Deployment**
   - The function should now be available in your database
   - You can test it by running: `SELECT process_inventory_consumption('test', 1, 'test', 'test')`

### Method 2: Using Supabase CLI (If Available)

If you have Supabase CLI installed:

```bash
# Initialize Supabase project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push

# Or apply specific migration
supabase db reset
```

## Function Details

The `process_inventory_consumption` function:
- **Purpose**: Atomically processes inventory consumption transactions
- **Parameters**: 
  - `p_item_id`: UUID of the inventory item
  - `p_quantity`: Amount to consume
  - `p_user_id`: UUID of the user performing the action
  - `p_user_name`: Name/email of the user
  - `p_project_order`: Optional project/order reference
  - `p_notes`: Optional notes
- **Returns**: JSONB with success/failure status and transaction details

## Security Features

- **Row Level Security**: Function uses `SECURITY DEFINER` for controlled access
- **Atomic Transactions**: All operations are wrapped in a single transaction
- **Validation**: Comprehensive input validation and error handling
- **Locking**: Uses `FOR UPDATE` to prevent race conditions

## Error Handling

The function handles these error scenarios:
- Item not found
- Invalid quantity (≤ 0)
- Insufficient stock
- Transaction failures

## Performance Optimizations

- Indexes on `inventory_items(id, current_stock, min_stock)`
- Indexes on `transactions(inventory_item_id, created_at DESC)`
- Efficient query patterns with row locking

## Testing

After deployment, test the function with:

```sql
-- Test with valid data
SELECT process_inventory_consumption(
    'your-item-id'::UUID,
    1.5,
    'your-user-id'::UUID,
    'test@example.com',
    'Test Project',
    'Test consumption'
);
```

## Next Steps

1. Deploy the function using Method 1 above
2. Test the verbruik functionality in the application
3. Verify that consumption transactions are properly logged
4. Monitor performance and adjust indexes if needed

## Troubleshooting

If the function still doesn't work after deployment:

1. Check that the `authenticated` role has EXECUTE permissions
2. Verify that RLS policies allow the operation
3. Check the Supabase logs for detailed error messages
4. Ensure the database schema matches the function expectations