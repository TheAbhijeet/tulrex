import { test, expect } from '@playwright/test';

test.describe('Base64 Encode / Decode Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/base64-encode-decode');
        await expect(page.getByRole('heading', { name: /Base64 Encode \/ Decode/i })).toBeVisible();
    });

    test('should encode plain text to Base64 correctly', async ({ page }) => {
        const inputText = 'Hello Toolzen!';
        const expectedOutput = 'SGVsbG8gVG9vbHplbiE='; // Standard Base64 for the input

        await page.getByLabel('Input Text / Base64:').fill(inputText);
        await page.getByRole('button', { name: 'Encode to Base64' }).click();

        // Assuming output is in a readonly textarea with label "Output:"
        await expect(page.getByLabel('Output:')).toHaveValue(expectedOutput);
        await expect(page.locator('.text-red-200')).toBeHidden();
    });

    test('should encode text with UTF-8 characters correctly', async ({ page }) => {
        const inputText = '你好世界'; // "Hello World" in Chinese
        const expectedOutput = '5L2g5aW95LiW55WM';

        await page.getByLabel('Input Text / Base64:').fill(inputText);
        await page.getByRole('button', { name: 'Encode to Base64' }).click();

        await expect(page.getByLabel('Output:')).toHaveValue(expectedOutput);
        await expect(page.locator('.text-red-200')).toBeHidden();
    });

    test('should decode valid Base64 to plain text correctly', async ({ page }) => {
        const inputText = 'SGVsbG8gVG9vbHplbiE=';
        const expectedOutput = 'Hello Toolzen!';

        await page.getByLabel('Input Text / Base64:').fill(inputText);
        await page.getByRole('button', { name: 'Decode from Base64' }).click();

        await expect(page.getByLabel('Output:')).toHaveValue(expectedOutput);
        await expect(page.locator('.text-red-200')).toBeHidden();
    });

    test('should decode Base64 representing UTF-8 characters correctly', async ({ page }) => {
        const inputText = '5L2g5aW95LiW55WM';
        const expectedOutput = '你好世界';

        await page.getByLabel('Input Text / Base64:').fill(inputText);
        await page.getByRole('button', { name: 'Decode from Base64' }).click();

        await expect(page.getByLabel('Output:')).toHaveValue(expectedOutput);
        await expect(page.locator('.text-red-200')).toBeHidden();
    });

    test('should show error when decoding invalid Base64 string', async ({ page }) => {
        const invalidInput = 'This is not base64!'; // Contains invalid chars

        await page.getByLabel('Input Text / Base64:').fill(invalidInput);
        await page.getByRole('button', { name: 'Decode from Base64' }).click();

        const errorElement = page.locator('#error');
        await expect(errorElement).toBeVisible();

        await expect(errorElement).toContainText(/Invalid Base64 string|decoding error/i);
    });

    test('should clear input and output when Clear button is clicked', async ({ page }) => {
        await page.getByLabel('Input Text / Base64:').fill('Test');
        await page.getByRole('button', { name: 'Encode to Base64' }).click();
        await expect(page.getByLabel('Output:')).not.toBeEmpty(); // Ensure output exists

        await page.getByRole('button', { name: 'Clear' }).click();

        await expect(page.getByLabel('Input Text / Base64:')).toBeEmpty();
        await expect(page.locator('#base64-output')).not.toBeVisible();
        await expect(page.locator('#error')).toBeHidden();
    });
});
