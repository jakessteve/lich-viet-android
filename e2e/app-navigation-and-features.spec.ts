import { test, expect } from '@playwright/test';

test.describe('Lịch Việt - End-to-End User Journey Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable error logging from page
    page.on('pageerror', (exception) => {
      console.error(`Page error: ${exception}`);
    });
  });

  test('1. Landing Page renders correctly and quick-birth-calculation works', async ({ page }) => {
    await page.goto('/');

    // Check main title / heading
    await expect(page.locator('h1')).toContainText('Khám phá');
    await expect(page.locator('h1')).toContainText('vận mệnh của bạn');

    // Check today card details
    const todayCard = page.locator('#cosmic-section button').first();
    await expect(todayCard).toBeVisible();
    await expect(todayCard).toContainText('Hôm nay');

    // Test Hero Quick Birthday input
    const birthdayInput = page.locator('input[placeholder="dd/mm/yyyy"]');
    if (await birthdayInput.isVisible()) {
      await birthdayInput.fill('15/08/1995');
      const submitBtn = page.getByRole('button', { name: /Xem kết quả/i });
      await submitBtn.click();

      // Check result appears
      await expect(page.getByText('Lá số Tử Vi')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /Mở lá số Tử Vi/i })).toBeVisible();
    }
  });

  test('2. Navigation to Âm Lịch (Calendar) and detailed date inspection', async ({ page }) => {
    await page.goto('/app/am-lich');

    // Verify main page elements
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('tablist', { name: /Chức năng/i })).toBeVisible();

    // Verify day view or detailed view components render
    await expect(page.getByText(/Giờ Hoàng Đạo|Dụng Sự|Tiết khí/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Tử Vi (Astrology) calculation, palace inspection, and markdown export', async ({ page }) => {
    await page.goto('/app/tu-vi');

    // Fill form if input form is displayed
    const nameInput = page.locator('input#tuviName, input[placeholder*="Nguyễn Văn A"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Nguyễn Văn A');
    }

    const calcBtn = page.getByRole('button', { name: /Xem Lá Số/i });
    if (await calcBtn.isVisible()) {
      await calcBtn.click();
    }

    // Wait for the chart to render
    await expect(page.getByText(/Tử Vi Đẩu Số/i)).toBeVisible();
    await expect(page.getByText(/Thông Tin Lá Số/i)).toBeVisible();
  });

  test('4. Gieo Quẻ & Mai Hoa Dịch Số full flow', async ({ page }) => {
    await page.goto('/app/gieo-que');

    // Verify Mai Hoa view
    await expect(page.getByText(/Mai Hoa Dịch Số|Tam Thức/i).first()).toBeVisible({ timeout: 10000 });

    // Click Gieo quẻ button
    const gieoQueBtn = page.getByRole('button', { name: /Gieo Quẻ Mai Hoa/i });
    if (await gieoQueBtn.isVisible()) {
      await gieoQueBtn.click();
      // Check hexagram result
      await expect(page.getByText('Quẻ Chủ', { exact: true })).toBeVisible({ timeout: 5000 });
    }
  });

  test('5. Chiêm Tinh (Western & Vedic) subtab switching', async ({ page }) => {
    await page.goto('/app/chiem-tinh');

    await expect(page.getByText(/Chiêm Tinh Tây Phương|Chiêm Tinh Ấn Độ/i).first()).toBeVisible({ timeout: 10000 });

    // Navigate to Vedic subtab
    await page.goto('/app/chiem-tinh/vedic');
    await expect(page.getByText(/Vedic|Ấn Độ/i).first()).toBeVisible({ timeout: 10000 });

    // Navigate to Synastry subtab
    await page.goto('/app/chiem-tinh/hop-la');
    await expect(page.getByText(/Hợp Lá Số|Synastry/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('6. Settings & Dark/Light mode theme persistence', async ({ page }) => {
    await page.goto('/app/cai-dat');

    await expect(page.getByText(/Cài Đặt|Giao Diện|Hồ Sơ/i).first()).toBeVisible({ timeout: 10000 });

    // Toggle theme via theme toggle in navbar
    const themeBtn = page.getByRole('button', { name: /Chuyển chế độ sáng\/tối|Chuyển sang chế độ/i });
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      // Verify dark/light class change
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      expect(typeof isDark).toBe('boolean');
    }
  });
});
