import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Studio Homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for glassmorphism animations to settle
    await page.waitForTimeout(2000);

    // Take a screenshot of the homepage and compare against baseline
    await expect(page).toHaveScreenshot('studio-homepage.png', {
      maxDiffPixels: 100, // Allow minor rendering differences
      fullPage: true,
    });
  });
});
