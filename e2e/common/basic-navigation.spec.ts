import { test, expect, Page } from '@playwright/test';
import toolsToTest from '../../tool-list.json';

// --- Helper function to check for console errors ---
async function checkConsoleErrors(page: Page): Promise<string[]> {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
        // Consider filtering out less critical messages if needed
        if (msg.type() === 'error') {
            // You might want to ignore specific known errors here if they are unavoidable
            // e.g., if (msg.text().includes('Some known benign error')) return;
            consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
        }
    });
    return consoleErrors; // Return the array ref, which will be populated
}

function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('Tool Page Loading and Console Errors', () => {
    for (const tool of toolsToTest) {
        test(`should load ${tool.slug} page without console errors`, async ({ page }) => {
            const consoleErrors = await checkConsoleErrors(page); // Setup listener

            const response = await page.goto(`/tools/${tool.slug}`);

            // 1. Check HTTP Status (indirectly via response.ok())
            expect(response?.ok(), `Page ${tool.slug} should load with OK status`).toBe(true);

            // 2. Check URL
            await expect(page, `Page URL should be correct for ${tool.slug}`).toHaveURL(
                `/tools/${tool.slug}`
            );

            await expect(page, `Page title should be correct for ${tool.slug}`).toHaveTitle(
                new RegExp(`.*${escapeRegex(tool.title)}.*`, 'i')
            );

            // 4. Check if the main heading is visible
            await expect(
                page.getByRole('heading', { level: 1, name: tool.title }),
                `Heading for ${tool.slug} should be visible`
            ).toBeVisible();

            // 5. Check Console Errors (after navigation and rendering)
            expect(consoleErrors, `Console should have no errors on ${tool.slug}`).toEqual([]);
        });
    }

    test('should load the Home page without console errors', async ({ page }) => {
        const consoleErrors = await checkConsoleErrors(page);
        const response = await page.goto('/');
        expect(response?.ok()).toBe(true);
        await expect(page).toHaveURL('/');
        await expect(page).toHaveTitle(/Toolzen - Simple Client-Side Developer Tools/i);
        await expect(page.getByRole('heading', { name: /Welcome to Toolzen/i })).toBeVisible();
        expect(consoleErrors).toEqual([]);
    });

    test('should load the About page without console errors', async ({ page }) => {
        const consoleErrors = await checkConsoleErrors(page);
        const response = await page.goto('/about');
        expect(response?.ok()).toBe(true);
        await expect(page).toHaveURL('/about');
        await expect(page).toHaveTitle(/About Toolzen/i);
        await expect(page.getByRole('heading', { name: /About Toolzen/i })).toBeVisible();
        expect(consoleErrors).toEqual([]);
    });
});
