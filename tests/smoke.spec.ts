import { test, expect } from '@playwright/test';

const LOCALES = [
  { path: '/', lang: 'en' },
  { path: '/es', lang: 'es' },
  { path: '/fr', lang: 'fr' },
];

for (const { path, lang } of LOCALES) {
  test(`home ${lang} loads with title, h1 and correct lang`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);

    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1').first()).toBeVisible();
  });
}

test('404 page renders', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(404);
});

const DYNAMIC_PAGES = [
  { path: '/ship-from-toronto-to-cuba/', lang: 'en', kind: 'city' },
  { path: '/ship-from-montreal-to-cuba/', lang: 'en', kind: 'city' },
  { path: '/ship-from-vancouver-to-cuba/', lang: 'en', kind: 'city' },
  { path: '/provinces/la-habana/', lang: 'en', kind: 'province' },
  { path: '/provinces/santiago-de-cuba/', lang: 'en', kind: 'province' },
];

for (const { path, lang, kind } of DYNAMIC_PAGES) {
  test(`dynamic ${kind} page ${path} loads with h1 and lang`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `${path} should be 200`).toBeLessThan(400);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1').first()).toBeVisible();
  });
}

test('navbar shows logo on any viewport and logo links home', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('nav img[alt="Box to Cuba"]').first();
  await expect(logo).toBeVisible();
  const logoLink = logo.locator('xpath=ancestor::a[1]');
  await expect(logoLink).toHaveAttribute('href', '/');
});

test('desktop nav shows rates link', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'Desktop-only test');
  await page.goto('/');
  const rates = page.locator('nav a[href="/canada-to-cuba-shipping-rates"]').first();
  await expect(rates).toBeVisible();
});

test('mobile hamburger opens menu and reveals rates link', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile', 'Mobile-only test');
  await page.goto('/');
  const btn = page.locator('#mobile-menu-btn');
  const menu = page.locator('#mobile-menu');

  await expect(btn).toBeVisible();
  await expect(menu).toBeHidden();

  await btn.click();
  await expect(menu).toBeVisible();
  await expect(menu.locator('a[href="/canada-to-cuba-shipping-rates"]')).toBeVisible();
});
