import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/tools/url-encoder-decoder');
  await page.getByRole('textbox', { name: 'Input Text / URL Component:' }).click();
  await page.getByRole('textbox', { name: 'Input Text / URL Component:' }).fill('https://djangocentral.com/');
  await page.getByRole('button', { name: 'Encode URI Component' }).click();
  await expect(page.getByRole('textbox', { name: 'Output:' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Output:' })).toHaveValue('https%3A%2F%2Fdjangocentral.com%2F');
  await expect(page.getByLabel('Output:')).toContainText('https%3A%2F%2Fdjangocentral.com%2F');
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByRole('textbox', { name: 'Input Text / URL Component:' })).toBeEmpty();
  await page.getByRole('textbox', { name: 'Input Text / URL Component:' }).click();
  await page.getByRole('textbox', { name: 'Input Text / URL Component:' }).fill('https%3A%2F%2Fdjangocentral.com%2F');
  await page.getByRole('button', { name: 'Encode URI Component' }).click();
  await expect(page.getByLabel('Output:')).toContainText('https%253A%252F%252Fdjangocentral.com%252F');
  await page.getByRole('button', { name: 'Decode URI Component' }).click();
  await expect(page.getByLabel('Output:')).toContainText('https://djangocentral.com/');
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('button', { name: 'Decode URI Component' }).click();
  await page.getByRole('button', { name: 'Clear' }).click();
});