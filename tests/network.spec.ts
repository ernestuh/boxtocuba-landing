import { test, expect } from '@playwright/test';

/**
 * These tests catch first-party regressions only. Third-party scripts
 * (analytics, Turnstile handshake, browser permission warnings) are
 * deliberately ignored — they're out of our control and too noisy to
 * fail the build on.
 */

const THIRD_PARTY_DOMAINS = [
  'googletagmanager.com',
  'google-analytics.com',
  'cloudflare.com',
  'cloudflareinsights.com',
  'doubleclick.net',
  'gstatic.com',
  'googleapis.com',
];

const CONSOLE_NOISE_PATTERNS = [
  /googletagmanager/i,
  /google-analytics/i,
  /cloudflare/i,
  /xr-spatial-tracking/i,
  /Permissions policy violation/i,
  /%c%d font-size:0/i, // Google Analytics canary
  /Failed to load resource:.*status of 401/i, // Turnstile handshake
  /TrustedHTML/i,
  /TrustedScript/i,
  /TrustedScriptURL/i,
  /Content Security Policy/i,
];

function isFirstParty(url: string, origin: string): boolean {
  try {
    const host = new URL(url).host;
    const myHost = new URL(origin).host;
    if (host !== myHost) return false;
    return !THIRD_PARTY_DOMAINS.some((d) => host.endsWith(d));
  } catch {
    return false;
  }
}

function isConsoleNoise(text: string): boolean {
  return CONSOLE_NOISE_PATTERNS.some((re) => re.test(text));
}

const PAGES = [
  { path: '/', label: 'home en' },
  { path: '/es', label: 'home es' },
  { path: '/fr', label: 'home fr' },
];

for (const { path, label } of PAGES) {
  test(`${label}: no failed first-party resources`, async ({ page, baseURL }) => {
    const failed: string[] = [];

    page.on('response', (res) => {
      const url = res.url();
      if (!isFirstParty(url, baseURL!)) return;
      if (res.status() >= 400 && res.status() < 600) {
        failed.push(`${res.status()} ${url}`);
      }
    });

    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!isFirstParty(url, baseURL!)) return;
      failed.push(`FAILED ${req.method()} ${url} (${req.failure()?.errorText})`);
    });

    await page.goto(path);
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

    expect(failed, `Failed first-party resources on ${path}:\n${failed.join('\n')}`).toHaveLength(0);
  });

  test(`${label}: no meaningful console errors or uncaught exceptions`, async ({ page }) => {
    const problems: string[] = [];

    page.on('pageerror', (e) => {
      if (!isConsoleNoise(e.message)) problems.push(`pageerror: ${e.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (isConsoleNoise(text)) return;
      problems.push(`console.error: ${text}`);
    });

    await page.goto(path);
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

    expect(problems, `Problems on ${path}:\n${problems.join('\n')}`).toHaveLength(0);
  });
}
