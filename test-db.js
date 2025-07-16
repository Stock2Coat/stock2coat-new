// Test script to check database connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rlgnxmygytofqmhmgfaa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ254bXlneXRvZnFtaG1nZmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDkwMDcsImV4cCI6MjA2ODIyNTAwN30.X7tqIKxDuvObszECJT1Njf-p_X1RV0oXa9PacCzXJCk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Database error:', error)
      return
    }
    
    console.log('Database connection successful!')
    console.log('Found', data.length, 'items')
    
    if (data.length > 0) {
      console.log('First item:', data[0])
    }
    
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

testConnection()