import { test, expect } from '@playwright/test';

test.describe('Sprint 7: File Versioning', () => {

    test('Review Page should have Files tab', async ({ page }) => {
        // Navigate to a project review page
        await page.goto('/project/test-project-id/review');

        // Check for Tabs
        await expect(page.getByText('Comments')).toBeVisible();
        await expect(page.getByText('Chat')).toBeVisible();
        await expect(page.getByText('Files')).toBeVisible();

        // Switch to Files Tab
        await page.click('text=Files');

        // Check for Upload UI
        await expect(page.getByText('Upload File')).toBeVisible();
        await expect(page.getByText('Drag & drop or click to browse')).toBeVisible();
    });

});
