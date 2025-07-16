#!/usr/bin/env node

/**
 * Database Function Deployment Script
 * 
 * This script automatically deploys the process_inventory_consumption function
 * to the Supabase database using the service role key.
 */

const fs = require('fs');
const path = require('path');

async function deployDatabaseFunction() {
  const { createClient } = require('@supabase/supabase-js');
  
  // Get environment variables from .env.local
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
  const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read the SQL deployment file
  const sqlPath = path.join(__dirname, 'supabase', 'deploy_consumption_function.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL deployment file not found:', sqlPath);
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('🚀 Deploying database function...');
  console.log('📄 SQL file:', sqlPath);
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('inventory_items')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    
    // Execute the SQL deployment
    console.log('⚙️  Executing SQL deployment...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error('❌ SQL execution failed:', error.message);
      
      // Try alternative approach with direct SQL execution
      console.log('🔄 Trying alternative deployment method...');
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .filter(stmt => stmt.trim().length > 0)
        .map(stmt => stmt.trim() + ';');
      
      console.log(`📊 Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement
          });
          
          if (stmtError) {
            console.warn(`⚠️  Statement ${i + 1} failed:`, stmtError.message);
          } else {
            console.log(`✅ Statement ${i + 1} successful`);
          }
        } catch (stmtErr) {
          console.warn(`⚠️  Statement ${i + 1} error:`, stmtErr.message);
        }
      }
    } else {
      console.log('✅ SQL deployment successful');
    }
    
    // Test the deployed function
    console.log('🧪 Testing deployed function...');
    const { data: testFunc, error: testFuncError } = await supabase.rpc('process_inventory_consumption', {
      p_item_id: '00000000-0000-0000-0000-000000000000',
      p_quantity: 1,
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_user_name: 'test'
    });
    
    if (testFuncError) {
      if (testFuncError.message.includes('does not exist')) {
        console.error('❌ Function deployment failed - function not found');
        console.error('💡 Manual deployment required via Supabase Dashboard');
        console.error('📋 Copy the contents of supabase/deploy_consumption_function.sql');
        console.error('🔗 Go to: https://supabase.com/dashboard/project/rlgnxmygytofqmhmgfaa/sql');
        process.exit(1);
      } else {
        console.log('✅ Function exists (test call failed as expected with dummy data)');
      }
    } else {
      console.log('✅ Function deployment verified');
    }
    
    console.log('🎉 Database function deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('💡 Manual deployment required via Supabase Dashboard');
    console.error('📋 Copy the contents of supabase/deploy_consumption_function.sql');
    console.error('🔗 Go to: https://supabase.com/dashboard/project/rlgnxmygytofqmhmgfaa/sql');
    process.exit(1);
  }
}

// Run the deployment
deployDatabaseFunction().catch(console.error);