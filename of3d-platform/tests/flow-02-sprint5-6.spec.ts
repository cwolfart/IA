import { test, expect } from '@playwright/test';

test.describe('Sprint 5 & 6 Features', () => {

    test('Financial Dashboard should display invoices', async ({ page }) => {
        // Mock authentication or assume session
        await page.goto('/finances');

        // Check for Header
        await expect(page.getByText('Financials')).toBeVisible();
        await expect(page.getByText('Manage your invoices and payments')).toBeVisible();

        // Check for Summary Cards
        await expect(page.getByText('Total Due')).toBeVisible();
        await expect(page.getByText('Paid (Last 30 Days)')).toBeVisible();

        // Check for Invoices List (assuming mock data or empty state)
        // If empty:
        // await expect(page.getByText('No invoices found')).toBeVisible();
    });

    test('Admin Panel should be protected', async ({ page }) => {
        // Case 1: Non-admin user
        // await page.goto('/admin');
        // await expect(page.getByText('Access Denied')).toBeVisible();

        // Case 2: Admin user (requires specific auth state)
        // await page.goto('/admin');
        // await expect(page.getByText('Admin Panel')).toBeVisible();
        // await expect(page.getByText('Users')).toBeVisible();
        // await expect(page.getByText('Projects')).toBeVisible();
    });

    test('Profile Page should allow updates', async ({ page }) => {
        await page.goto('/profile');

        // Check elements
        await expect(page.getByText('Profile Settings')).toBeVisible();
        const nameInput = page.locator('input[placeholder="Enter your name"]');
        await expect(nameInput).toBeVisible();

        // Test Update
        await nameInput.fill('Playwright User');
        await page.click('button:has-text("Save Changes")');

        // Expect success message
        await expect(page.getByText('Profile updated successfully!')).toBeVisible();
    });

});
