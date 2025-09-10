import { test, expect } from '@playwright/test';

test('Test text difference', async ({ page }) => {
    await page.goto('/tools/text-diff-viewer');
    await expect(page.getByRole('heading', { name: /Text Diff Viewer/i })).toBeVisible();

    // Given inputs
    const textA = 'Hello World';
    const textB = 'Hello';
    await page.locator('#text-a').fill(textA);
    await page.locator('#text-b').fill(textB);

    // When Compare button is clicked
    await page.click('#compare');

    // Then output div should be visible
    const output = await page.locator('#output');
    await expect(output).toBeVisible();

    // Then text diff should be displayed
    const preText = await page.locator('#output pre');

    await expect(preText).toContainText('Hello');
    await expect(preText.locator('span.bg-red-900')).toContainText('World');

    const removedText = await preText.locator('span.bg-red-900');
    await expect(removedText).toHaveClass(/line-through/);
    await expect(removedText).toHaveClass(/text-red-300/);

    await page.click('#clear');
    await expect(output).not.toBeVisible();
});
