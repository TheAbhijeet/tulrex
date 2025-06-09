import { test, expect } from '@playwright/test';

test.use({
    permissions: ['clipboard-write'],
});

test('Test JSON formatter with valid JSON', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /JSON Formatter/i })).toBeVisible();

    // Given valid JSON
    const validJson = '{"name": "Toolzen", "version": 1, "active": true}';

    // When Format & Validate button is clicked
    await page.locator('#input').fill(validJson);
    await page.click('#format');

    // Then formatted JSON should be displayed
    const formattedJson = await page.locator('#output').innerText();
    await expect(JSON.parse(formattedJson)).toEqual(JSON.parse(validJson));

    // Then error message should not be displayed
    const error = await page.locator('#error');
    await expect(error).not.toBeVisible();

    // When copy button is clicked
    await page.click('#copy');

    // Then JSON is copied to clipboard
    // Then: Verify that the clipboard contains the expected JSON
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    // Check if the clipboard contains the correct JSON string
    expect(clipboardText).toBe(formattedJson);

    // Clear input
    await page.click('#clear');

    // Assert cleared state
    await expect(page.locator('#input')).toBeEmpty();
    await expect(page.locator('#output')).not.toBeVisible();
    await expect(page.locator('#error')).not.toBeVisible();
});

test('Test JSON formatter with invalid JSON', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /JSON Formatter/i })).toBeVisible();

    // Given invalid JSON
    const invalidJson = '{"name": "Toolzen", version: 1}';

    // When Format & Validate button is clicked
    await page.locator('#input').fill(invalidJson);
    await page.click('#format');

    // Then formatted JSON should not be displayed
    const formattedJson = await page.locator('#output');
    await expect(formattedJson).not.toBeVisible();

    // Then error message should be displayed
    const error = await page.locator('#error');
    await expect(error).toContainText(/Invalid JSON/i);
});
