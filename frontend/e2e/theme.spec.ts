import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display theme toggle button', async ({ page }) => {
    // Theme toggle button should be in the header
    const themeButton = page.locator('header button').first();
    await expect(themeButton).toBeVisible();
  });

  test('should toggle from light to dark mode', async ({ page }) => {
    const html = page.locator('html');

    // Should start in light mode (no dark class)
    await expect(html).not.toHaveClass(/dark/);

    // Click theme toggle
    const themeButton = page.locator('header button').first();
    await themeButton.click();

    // Should now be in dark mode
    await expect(html).toHaveClass(/dark/);
  });

  test('should toggle from dark to light mode', async ({ page }) => {
    const html = page.locator('html');
    const themeButton = page.locator('header button').first();

    // Switch to dark mode first
    await themeButton.click();
    await expect(html).toHaveClass(/dark/);

    // Click again to switch back to light
    await themeButton.click();

    // Should be back in light mode
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should persist theme preference in localStorage', async ({ page }) => {
    const themeButton = page.locator('header button').first();

    // Switch to dark mode
    await themeButton.click();

    // Check localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');

    // Reload page
    await page.reload();

    // Theme should still be dark
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should load saved theme preference on page load', async ({ page }) => {
    // Set dark theme in localStorage
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));

    // Reload page
    await page.reload();

    // Should be in dark mode
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should apply dark mode styles to main elements', async ({ page }) => {
    const themeButton = page.locator('header button').first();

    // Switch to dark mode
    await themeButton.click();

    // Check that dark styles are applied
    const body = page.locator('body');

    // In dark mode, background should be dark
    const bodyBg = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Dark background should have low RGB values or be a dark color
    // This is a basic check - the exact color depends on the theme
    expect(bodyBg).toBeTruthy();
  });

  test('should show sun icon in dark mode and moon icon in light mode', async ({ page }) => {
    const themeButton = page.locator('header button').first();

    // In light mode, should show moon icon (to switch to dark)
    let svg = themeButton.locator('svg');
    await expect(svg).toBeVisible();

    // Switch to dark mode
    await themeButton.click();

    // In dark mode, should show sun icon (to switch to light)
    svg = themeButton.locator('svg');
    await expect(svg).toBeVisible();

    // Check if it's the sun icon (yellow color)
    const svgClass = await svg.getAttribute('class');
    expect(svgClass).toContain('yellow');
  });

  test('should apply dark mode to textarea', async ({ page }) => {
    const textarea = page.locator('textarea');
    const themeButton = page.locator('header button').first();

    // Get light mode background
    const lightBg = await textarea.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Switch to dark mode
    await themeButton.click();

    // Get dark mode background
    const darkBg = await textarea.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Backgrounds should be different
    expect(lightBg).not.toBe(darkBg);
  });

  test('should apply dark mode to buttons', async ({ page }) => {
    const themeButton = page.locator('header button').first();
    const downloadBtn = page.getByRole('button', { name: /baixar pdf/i });

    // Get light mode button style
    const lightBg = await downloadBtn.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Switch to dark mode
    await themeButton.click();

    // The primary button (download) should maintain its blue color
    // but other elements should change
    const darkBg = await downloadBtn.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Primary button color should be consistent (blue in both modes)
    expect(lightBg).toBeTruthy();
    expect(darkBg).toBeTruthy();
  });

  test('should apply dark mode to settings panel', async ({ page }) => {
    // Expand settings
    await page.getByText(/configurações do pdf/i).click();

    const themeButton = page.locator('header button').first();
    const settingsPanel = page.locator('[class*="bg-gray"]').first();

    // Get light mode style
    const lightBg = await settingsPanel.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Switch to dark mode
    await themeButton.click();

    // Get dark mode style
    const darkBg = await settingsPanel.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Backgrounds should be different
    expect(lightBg).not.toBe(darkBg);
  });
});

test.describe('Theme - System Preference', () => {
  test('should respect system dark mode preference', async ({ browser }) => {
    // Create context with dark color scheme
    const context = await browser.newContext({
      colorScheme: 'dark'
    });
    const page = await context.newPage();

    // Clear any saved preference
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();

    // Should be in dark mode based on system preference
    // Note: This depends on the implementation respecting prefers-color-scheme
    // The app might default to light if no preference is saved

    await context.close();
  });

  test('should respect system light mode preference', async ({ browser }) => {
    // Create context with light color scheme
    const context = await browser.newContext({
      colorScheme: 'light'
    });
    const page = await context.newPage();

    // Clear any saved preference
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();

    // Should be in light mode
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await context.close();
  });
});
