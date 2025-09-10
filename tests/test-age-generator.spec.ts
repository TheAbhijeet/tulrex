import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/tools/age-calculator');
    await page.getByRole('button', { name: 'Calculate Age' }).click();
    await expect(page.getByText('Please select both Birth Date')).toBeVisible();
    await page.getByRole('textbox', { name: 'Birth Date:' }).fill('2022-01-10');
    await page.getByRole('textbox', { name: 'Calculate Age As Of:' }).fill('2025-11-07');
    await page.getByRole('button', { name: 'Calculate Age' }).click();
    await expect(page.getByRole('main')).toContainText('3 years, 9 months, 28 days');
    await page.getByText('Total Days:').click();
    await expect(page.getByRole('main')).toContainText('Total Days: 1,397');
});
