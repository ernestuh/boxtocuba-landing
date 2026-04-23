import { test, expect } from '@playwright/test';

const LOCALE_PAGES = [
  { lang: 'en', home: '/', rates: '/canada-to-cuba-shipping-rates', privacy: '/privacy-policy' },
  { lang: 'es', home: '/es', rates: '/es/precios-envio-canada-cuba', privacy: '/es/politica-de-privacidad' },
  { lang: 'fr', home: '/fr', rates: '/fr/tarifs-envoi-canada-cuba', privacy: '/fr/politique-de-confidentialite' },
];

for (const { lang, home, rates, privacy } of LOCALE_PAGES) {
  test(`locale ${lang}: home, rates and privacy respond 200 with correct lang`, async ({ page }) => {
    for (const path of [home, rates, privacy]) {
      const res = await page.goto(path);
      expect(res?.status(), `${path} should be 200`).toBeLessThan(400);
      await expect(page.locator('html'), `${path} should have lang=${lang}`).toHaveAttribute('lang', lang);
    }
  });
}

test('home page exposes hreflang for all three locales', async ({ page }) => {
  await page.goto('/');
  const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
    els.map((el) => el.getAttribute('hreflang')),
  );
  for (const expected of ['en', 'es', 'fr']) {
    expect(hreflangs).toContain(expected);
  }
});

const HERO_HEADLINES = [
  { path: '/', lang: 'en', text: /Send love from Canada to Cuba/i },
  { path: '/es', lang: 'es', text: /Envía amor de Canadá a Cuba/i },
  { path: '/fr', lang: 'fr', text: /Envoyez de l.amour du Canada à Cuba/i },
];

for (const { path, lang, text } of HERO_HEADLINES) {
  test(`home ${lang} shows its localized hero headline`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('body')).toContainText(text);
  });
}
