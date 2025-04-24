import { test, expect } from '@playwright/test';

test.describe('Password Generator Tool', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tools/password-generator'); // Assuming this slug
        await expect(page.getByRole('heading', { name: /Password Generator/i })).toBeVisible();
    });

    test('should generate a password when button is clicked', async ({ page }) => {
        // Assuming there's an input/div to display the password and a Generate button
        const passwordOutput = page.locator('#password-output'); // CHANGE SELECTOR
        const generateButton = page.getByRole('button', { name: /Generate/i }); // CHANGE SELECTOR if needed

        await expect(passwordOutput).toHaveValue(''); // Or be empty/placeholder initially

        await generateButton.click();

        // Check that the output is no longer empty
        await expect(passwordOutput).not.toHaveValue('');

        // Basic check: ensure generated password has some length (default length?)
        const generatedPassword = await passwordOutput.inputValue();
        expect(generatedPassword.length).toBeGreaterThan(10); // Adjust expected length
        await expect(page.locator('.text-red-200')).toBeHidden(); // No errors expected
    });

    test('should respect length option', async ({ page }) => {
        const passwordOutput = page.locator('#password-output'); // CHANGE SELECTOR
        const generateButton = page.getByRole('button', { name: /Generate/i }); // CHANGE SELECTOR
        const lengthInput = page.getByLabel(/Length:/i); // CHANGE SELECTOR (might be input type=number or range)

        // Set length to a specific value
        const targetLength = 8;
        await lengthInput.fill(targetLength.toString());
        // Or use slider interactions if it's a range input

        await generateButton.click();

        const generatedPassword = await passwordOutput.inputValue();
        expect(generatedPassword.length).toBe(targetLength);
        await expect(page.locator('.text-red-200')).toBeHidden();
    });

    test('should respect character type options (e.g., no numbers)', async ({ page }) => {
        const passwordOutput = page.locator('#password-output'); // CHANGE SELECTOR
        const generateButton = page.getByRole('button', { name: /Generate/i }); // CHANGE SELECTOR
        const numbersCheckbox = page.getByLabel(/Include Numbers/i); // CHANGE SELECTOR (assuming checkboxes)

        // Ensure numbers ARE included initially (if default)
        await expect(numbersCheckbox).toBeChecked();
        await generateButton.click();
        let generatedPassword = await passwordOutput.inputValue();
        // Check if it likely contains numbers (not foolproof but a decent check)
        expect(generatedPassword).toMatch(/[0-9]/);

        // Uncheck numbers
        await numbersCheckbox.uncheck();
        await expect(numbersCheckbox).not.toBeChecked();

        // Generate again (might need multiple clicks/checks for robustness)
        await generateButton.click();
        generatedPassword = await passwordOutput.inputValue();
        console.log('Password without numbers:', generatedPassword); // For debugging

        // Check that the new password does NOT contain numbers
        expect(generatedPassword).not.toMatch(/[0-9]/);
        await expect(page.locator('.text-red-200')).toBeHidden();
    });

    // Add more tests for other options: symbols, uppercase, lowercase etc.
    // Add non-happy path tests if applicable (e.g., length set to 0 or negative - depends on input validation)
});
