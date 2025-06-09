import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/tools/json-formatter');
  await page.getByRole('textbox', { name: 'Paste your JSON here...' }).click();
  await page.getByRole('textbox', { name: 'Paste your JSON here...' }).fill('[{\n    "id": "2262c7e2-1b4d-41d1-a0e0-34ef7160ed86",\n    "name":          "Hannah Smith", "email": "willow.martin@sample.co", "isActive": false,\n    "registered": "2001-04-29T21:10:13.194Z"},{\n    "id": "fb256c40-da1c-4f25-8fd3-f848dce66f27",\n    "name": "Victor Clark",\n    "email": "julia.martinez@demo.io", "isActive": true,\n    "registered": "2017-02-03T21:06:45.111Z"\n  }\n]');
  await page.getByRole('button', { name: 'Format & Validate' }).click();
  await expect(page.locator('#output')).toContainText('[ { "id": "2262c7e2-1b4d-41d1-a0e0-34ef7160ed86", "name": "Hannah Smith", "email": "willow.martin@sample.co", "isActive": false, "registered": "2001-04-29T21:10:13.194Z" }, { "id": "fb256c40-da1c-4f25-8fd3-f848dce66f27", "name": "Victor Clark", "email": "julia.martinez@demo.io", "isActive": true, "registered": "2017-02-03T21:06:45.111Z" } ]');
  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.locator('#output')).toBeVisible();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('button', { name: 'Format & Validate' }).click();
  await expect(page.locator('#error')).toContainText('Input JSON is empty.');
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByRole('textbox', { name: 'Paste your JSON here...' })).toBeEmpty();
  await page.getByRole('textbox', { name: 'Paste your JSON here...' }).click();

  await expect(page.locator('#input')).toBeEmpty();
  await expect(page.locator('#output')).not.toBeVisible();
  await expect(page.locator('#error')).not.toBeVisible();
});