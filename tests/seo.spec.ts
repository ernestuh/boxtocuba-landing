import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const INDEX_PATH = join(DIST, 'sitemap-index.xml');

test('robots.txt (dev) exists and disallows /proposal-', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/User-agent:\s*\*/i);
  expect(body).toMatch(/Disallow:\s*\/proposal-/i);
  expect(body).toMatch(/Sitemap:/i);
});

test('built sitemap-index references child sitemaps', () => {
  test.skip(!existsSync(INDEX_PATH), 'Run `npm run build` first — sitemap is only generated at build time.');
  const body = readFileSync(INDEX_PATH, 'utf-8');
  expect(body).toContain('<sitemapindex');
  expect(body).toMatch(/<loc>.*sitemap-\d+\.xml<\/loc>/);
});

test('built sitemap does NOT include proposal-* or test-* URLs', () => {
  test.skip(!existsSync(INDEX_PATH), 'Run `npm run build` first.');
  const indexBody = readFileSync(INDEX_PATH, 'utf-8');
  const childUrls = Array.from(indexBody.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  expect(childUrls.length).toBeGreaterThan(0);

  for (const childUrl of childUrls) {
    const pathname = new URL(childUrl).pathname;
    const filePath = join(DIST, pathname);
    if (!existsSync(filePath)) continue;
    const body = readFileSync(filePath, 'utf-8');
    expect(body, `proposal-* URL leaked into ${pathname}`).not.toMatch(/\/proposal-/);
    expect(body, `test-* URL leaked into ${pathname}`).not.toMatch(/\/test-/);
  }
});

test('home has essential meta tags and hreflang for 3 locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
  const hreflangCount = await page.locator('link[rel="alternate"][hreflang]').count();
  expect(hreflangCount).toBeGreaterThanOrEqual(3);
});

test('home has complete Open Graph tags', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /^https?:\/\//);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /^https?:\/\/.+\.(jpg|jpeg|png|webp)/i,
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', /^[a-z]{2}_[A-Z]{2}$/);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', /.+/);
});

test('home has Twitter card tags', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', /summary/);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^https?:\/\//);
});

test('home has valid LocalBusiness JSON-LD', async ({ page }) => {
  await page.goto('/');
  const jsonLdTexts = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLdTexts.length, 'at least one JSON-LD script').toBeGreaterThan(0);

  const parsed = jsonLdTexts.map((t) => {
    try {
      return JSON.parse(t);
    } catch (e) {
      throw new Error(`Invalid JSON-LD: ${t.slice(0, 100)}...`);
    }
  });

  const localBusiness = parsed.find((j) => j['@type'] === 'LocalBusiness');
  expect(localBusiness, 'LocalBusiness JSON-LD is present').toBeDefined();
  expect(localBusiness.name).toBe('Box to Cuba');
  expect(localBusiness.url).toContain('boxtocuba.ca');
  expect(localBusiness['@context']).toBe('https://schema.org');
});
