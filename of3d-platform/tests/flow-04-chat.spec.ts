import { test, expect } from '@playwright/test';

test.describe('Sprint 7: Real-time Chat', () => {

    test('Review Page should have Chat tab', async ({ page }) => {
        // Mock auth or assume session
        // Navigate to a project review page (using a dummy ID)
        await page.goto('/project/test-project-id/review');

        // Check for Tabs
        await expect(page.getByText('Comments')).toBeVisible();
        await expect(page.getByText('Chat')).toBeVisible();

        // Switch to Chat Tab
        await page.click('text=Chat');

        // Check for Chat UI
        await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
        // Check for Send button (icon)
        // await expect(page.locator('button:has(svg.lucide-send)')).toBeVisible();
    });

});
