import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/tools/text-counter');
    await page.getByRole('textbox', { name: 'Paste or type your text here' }).click();
    await page
        .getByRole('textbox', { name: 'Paste or type your text here' })
        .fill('aaa hshs akak\najjjjjjjjjjjjjjjjjjjjhsj sssssssssssssssssssjl\n\nancb ssk dld');
    await expect(page.getByRole('main')).toContainText('74');
    await page.getByText('8', { exact: true }).click();
    await page.getByText('4', { exact: true }).dblclick();
    await expect(page.getByRole('main')).toContainText('8');
    await expect(page.getByRole('main')).toContainText('4');
    await expect(page.getByRole('main')).toContainText('74');
});
