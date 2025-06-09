import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/tools/age-calculator');
  await page.getByRole('button', { name: 'Calculate Age' }).click();
  await expect(page.getByText('Please select both Birth Date')).toBeVisible();
  await page.getByRole('textbox', { name: 'Birth Date:' }).fill('2022-01-10');
  await page.getByRole('button', { name: 'Calculate Age' }).click();
  await expect(page.getByText('Age Result3 years, 4 months,')).toBeVisible();
  await expect(page.getByRole('main')).toContainText('3 years, 4 months, 3 days');
  await page.getByText('Total Days:').click();
await expect(page.getByRole('main')).toContainText('Total Days: 1,219');
});