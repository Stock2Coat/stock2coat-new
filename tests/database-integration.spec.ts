import { test, expect } from '@playwright/test';

test.describe('Database Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to inventory page
    await page.goto('http://localhost:3000/inventory');
  });

  test('should load real database data instead of mock data', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-testid="inventory-table"]', { timeout: 10000 });
    
    // Check that we have 10 items (database data) instead of 3 (mock data)
    await expect(page.locator('text=10 van 10 items')).toBeVisible();
    
    // Check for real database brands (Akzo Nobel, Tiger) instead of mock (Teknos, Hempel, PPG)
    await expect(page.locator('text=Akzo Nobel')).toBeVisible();
    await expect(page.locator('text=Tiger')).toBeVisible();
    
    // Check for real RAL codes from database
    await expect(page.locator('text=RAL1000')).toBeVisible();
    await expect(page.locator('text=RAL3020')).toBeVisible();
    await expect(page.locator('text=RAL5015')).toBeVisible();
    
    // Ensure mock data is NOT present
    await expect(page.locator('text=Teknos')).not.toBeVisible();
    await expect(page.locator('text=Hempel')).not.toBeVisible();
    await expect(page.locator('text=PPG')).not.toBeVisible();
  });

  test('should persist item edits to database', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="inventory-table"]', { timeout: 10000 });
    
    // Find the first item (RAL1000) and click edit
    const firstEditButton = page.locator('button:has-text("Bewerken")').first();
    await firstEditButton.click();
    
    // Wait for edit modal to open
    await page.waitForSelector('[data-testid="edit-modal"]', { timeout: 5000 });
    
    // Change the brand to a test value
    const brandInput = page.locator('input[name="brand"]');
    await brandInput.fill('TEST MERK PLAYWRIGHT');
    
    // Save changes
    await page.locator('button:has-text("Opslaan")').click();
    
    // Wait for modal to close
    await page.waitForSelector('[data-testid="edit-modal"]', { state: 'hidden' });
    
    // Verify the change is visible in the table
    await expect(page.locator('text=TEST MERK PLAYWRIGHT')).toBeVisible();
    
    // Refresh the page to test persistence
    await page.reload();
    
    // Wait for page to load again
    await page.waitForSelector('[data-testid="inventory-table"]', { timeout: 10000 });
    
    // Verify the change persisted after refresh
    await expect(page.locator('text=TEST MERK PLAYWRIGHT')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // Start navigation but don't wait for load
    await page.goto('http://localhost:3000/inventory');
    
    // Should show loading state initially
    await expect(page.locator('text=Laden...')).toBeVisible();
    
    // Then should load real data
    await page.waitForSelector('[data-testid="inventory-table"]', { timeout: 10000 });
    await expect(page.locator('text=10 van 10 items')).toBeVisible();
  });

  test('should handle search functionality with real data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="inventory-table"]', { timeout: 10000 });
    
    // Search for a specific RAL code
    const searchInput = page.locator('input[placeholder="Zoek RAL code..."]');
    await searchInput.fill('RAL1000');
    
    // Should show only the matching item
    await expect(page.locator('text=RAL1000')).toBeVisible();
    await expect(page.locator('text=RAL3020')).not.toBeVisible();
    
    // Clear search
    await searchInput.fill('');
    
    // Should show all items again
    await expect(page.locator('text=RAL1000')).toBeVisible();
    await expect(page.locator('text=RAL3020')).toBeVisible();
  });

  test('should handle status filter with real data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="inventory-table"]', { timeout: 10000 });
    
    // Click on status filter
    const statusFilter = page.locator('button:has-text("Alle")');
    await statusFilter.click();
    
    // Select "OK" status
    await page.locator('text=OK').click();
    
    // Should show only OK items
    await expect(page.locator('.bg-green-100')).toBeVisible(); // OK status badge
    
    // Should not show LAAG items
    await expect(page.locator('.bg-red-100')).not.toBeVisible(); // LAAG status badge
  });
});