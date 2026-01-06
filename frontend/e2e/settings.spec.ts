import { test, expect } from '@playwright/test';

test.describe('PDF Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle settings panel visibility', async ({ page }) => {
    // Settings panel should be collapsed by default
    const settingsContent = page.locator('text=/tamanho da página/i');
    await expect(settingsContent).not.toBeVisible();

    // Click to expand settings
    await page.getByText(/configurações do pdf/i).click();

    // Settings should now be visible
    await expect(settingsContent).toBeVisible();

    // Click again to collapse
    await page.getByText(/configurações do pdf/i).click();

    // Settings should be hidden again
    await expect(settingsContent).not.toBeVisible();
  });

  test('should display all settings options when expanded', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    // Check for page size selector
    await expect(page.locator('select').first()).toBeVisible();

    // Check for orientation buttons
    await expect(page.getByRole('button', { name: /retrato/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /paisagem/i })).toBeVisible();

    // Check for margin inputs
    await expect(page.locator('input[type="number"]').first()).toBeVisible();

    // Check for page numbers checkbox
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test('should change page size', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    // Get the page size select
    const select = page.locator('select').first();

    // Change to Letter
    await select.selectOption('Letter');
    await expect(select).toHaveValue('Letter');

    // Change to A3
    await select.selectOption('A3');
    await expect(select).toHaveValue('A3');

    // Change back to A4
    await select.selectOption('A4');
    await expect(select).toHaveValue('A4');
  });

  test('should toggle orientation between portrait and landscape', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    const portraitBtn = page.getByRole('button', { name: /retrato/i });
    const landscapeBtn = page.getByRole('button', { name: /paisagem/i });

    // Portrait should be selected by default (has different styling)
    // Click landscape
    await landscapeBtn.click();

    // Now landscape should be selected
    await expect(landscapeBtn).toHaveClass(/bg-blue/);

    // Click portrait again
    await portraitBtn.click();

    // Portrait should be selected
    await expect(portraitBtn).toHaveClass(/bg-blue/);
  });

  test('should update margin values', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    // Get margin inputs (there should be 4)
    const marginInputs = page.locator('input[type="number"]');

    // Change top margin
    const topMargin = marginInputs.first();
    await topMargin.fill('3');
    await expect(topMargin).toHaveValue('3');

    // Change bottom margin
    const bottomMargin = marginInputs.nth(1);
    await bottomMargin.fill('1.5');
    await expect(bottomMargin).toHaveValue('1.5');
  });

  test('should change margin unit', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    // Get unit selector (should be the second select or near margin inputs)
    const unitSelect = page.locator('select').last();

    // Change to mm
    await unitSelect.selectOption('mm');
    await expect(unitSelect).toHaveValue('mm');

    // Change to inches
    await unitSelect.selectOption('in');
    await expect(unitSelect).toHaveValue('in');

    // Change back to cm
    await unitSelect.selectOption('cm');
    await expect(unitSelect).toHaveValue('cm');
  });

  test('should toggle page numbers checkbox', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    const checkbox = page.locator('input[type="checkbox"]');

    // Should be unchecked by default
    await expect(checkbox).not.toBeChecked();

    // Check it
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Uncheck it
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should preserve settings when generating PDF', async ({ page }) => {
    // Expand settings and configure
    await page.getByText(/configurações do pdf/i).click();

    // Select Letter size
    await page.locator('select').first().selectOption('Letter');

    // Select landscape
    await page.getByRole('button', { name: /paisagem/i }).click();

    // Enable page numbers
    await page.locator('input[type="checkbox"]').check();

    // Load example HTML
    await page.getByRole('button', { name: /carregar exemplo/i }).click();

    // Start conversion (settings should be preserved)
    await page.getByRole('button', { name: /visualizar/i }).click();

    // Wait briefly and verify settings are still set
    await page.waitForTimeout(500);

    // Settings should still be the same
    await expect(page.locator('select').first()).toHaveValue('Letter');
    await expect(page.locator('input[type="checkbox"]')).toBeChecked();
  });
});
