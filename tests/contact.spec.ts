import { test, expect, type Page } from '@playwright/test';

const API_URL_PATTERN = '**/functions/v1/contact-form';
const MOCK_TOKEN = 'mock-turnstile-token';

async function mockTurnstile(page: Page) {
  await page.route('**/challenges.cloudflare.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.addInitScript((token) => {
    const setup = () => {
      if (!document.querySelector('script[data-mock-turnstile]')) {
        const s = document.createElement('script');
        s.dataset.mockTurnstile = 'true';
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        document.head?.appendChild(s);
      }
      (window as unknown as { turnstile: unknown }).turnstile = {
        render: (_el: unknown, opts: { callback?: (t: string) => void }) => {
          queueMicrotask(() => opts.callback?.(token));
          return 'mock-widget-id';
        },
        remove: () => {},
        reset: () => {},
      };
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup, { once: true });
    } else {
      setup();
    }
  }, MOCK_TOKEN);
}

async function mockBackend(
  page: Page,
  { status = 200, body = { ok: true } }: { status?: number; body?: unknown } = {}
) {
  await page.route(API_URL_PATTERN, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

function getForm(page: Page) {
  return page.locator('form').filter({ has: page.locator('input[type="email"]') }).first();
}

function getSubmit(page: Page) {
  return getForm(page).locator('button[type="submit"]');
}

async function waitForTurnstileReady(page: Page) {
  await expect(getSubmit(page)).toBeEnabled();
}

async function fillValidForm(page: Page) {
  const form = getForm(page);
  await form.locator('input[type="text"]').nth(0).fill('Test User');
  await form.locator('input[type="email"]').fill('test@example.com');
  await form.locator('select').nth(0).selectOption('ON');
  await form.locator('input[type="text"]').nth(1).fill('Toronto');
  await form.locator('select').nth(1).selectOption('la-habana');
  await form.locator('input[type="text"]').nth(2).fill('Vedado');
  await form.locator('input[type="number"]').fill('25');
}

const LOCALES = [
  {
    path: '/',
    lang: 'en',
    nameLabel: 'Full name',
    submitText: 'Send message',
    successTitle: 'Message sent!',
    errorText: 'Something went wrong',
  },
  {
    path: '/es/',
    lang: 'es',
    nameLabel: 'Nombre completo',
    submitText: 'Enviar mensaje',
    successTitle: '¡Mensaje enviado!',
    errorText: 'Algo salió mal',
  },
  {
    path: '/fr/',
    lang: 'fr',
    nameLabel: 'Nom complet',
    submitText: 'Envoyer',
    successTitle: 'Message envoyé',
    errorText: 'Une erreur s\'est produite',
  },
] as const;

for (const locale of LOCALES) {
  test(`contact form renders with ${locale.lang} labels`, async ({ page }) => {
    await mockTurnstile(page);
    await page.goto(locale.path);
    const form = getForm(page);
    await expect(form).toBeVisible();
    await expect(form.locator('label', { hasText: locale.nameLabel })).toBeVisible();
    await expect(getSubmit(page)).toContainText(locale.submitText);
  });
}

test('submit with empty required fields shows inline errors', async ({ page }) => {
  await mockTurnstile(page);
  await page.goto('/');
  await waitForTurnstileReady(page);
  await getSubmit(page).click();
  const form = getForm(page);
  await expect(form.getByText('Name is required')).toBeVisible();
  await expect(form.getByText('Please provide an email or phone number').first()).toBeVisible();
  await expect(form.getByText('Select your Canadian province')).toBeVisible();
  await expect(form.getByText('Select the Cuban province')).toBeVisible();
  await expect(form.getByText('Enter an estimated weight')).toBeVisible();
});

test('form accepts phone-only submission (no email) as valid contact', async ({ page }) => {
  await mockTurnstile(page);
  await mockBackend(page, { status: 200 });
  await page.goto('/');
  await waitForTurnstileReady(page);
  const form = getForm(page);
  await form.locator('input[type="text"]').nth(0).fill('Phone Only');
  await form.locator('input[type="tel"]').fill('+1 416 555 0100');
  await form.locator('select').nth(0).selectOption('ON');
  await form.locator('input[type="text"]').nth(1).fill('Toronto');
  await form.locator('select').nth(1).selectOption('la-habana');
  await form.locator('input[type="text"]').nth(2).fill('Vedado');
  await form.locator('input[type="number"]').fill('25');
  await getSubmit(page).click();
  await expect(page.getByText('Message sent!')).toBeVisible();
});

test('selecting a Canadian province reveals suggested cities and populates the city field', async ({ page }) => {
  await mockTurnstile(page);
  await page.goto('/');
  await waitForTurnstileReady(page);
  const form = getForm(page);
  await form.locator('select').nth(0).selectOption('ON');
  const torontoChip = form.getByRole('button', { name: 'Toronto' });
  await expect(torontoChip).toBeVisible();
  await torontoChip.click();
  await expect(form.locator('input[type="text"]').nth(1)).toHaveValue('Toronto');
});

test('selecting a Cuban province reveals suggested municipalities', async ({ page }) => {
  await mockTurnstile(page);
  await page.goto('/');
  await waitForTurnstileReady(page);
  const form = getForm(page);
  await form.locator('select').nth(1).selectOption('la-habana');
  await expect(form.getByRole('button', { name: 'Vedado' })).toBeVisible();
  await expect(form.getByRole('button', { name: 'Habana Vieja' })).toBeVisible();
});

test('successful submission (mock 200) shows success screen and hides the form', async ({ page }) => {
  await mockTurnstile(page);
  await mockBackend(page, { status: 200 });
  await page.goto('/');
  await waitForTurnstileReady(page);
  await fillValidForm(page);
  await getSubmit(page).click();
  await expect(page.getByText('Message sent!')).toBeVisible();
  await expect(page.getByText("We'll get back to you within a few hours.", { exact: true })).toBeVisible();
  await expect(getForm(page)).toHaveCount(0);
});

test('backend 500 shows the error banner and keeps the form usable', async ({ page }) => {
  await mockTurnstile(page);
  await mockBackend(page, { status: 500, body: { error: 'boom' } });
  await page.goto('/');
  await waitForTurnstileReady(page);
  await fillValidForm(page);
  await getSubmit(page).click();
  const form = getForm(page);
  await expect(form.getByText(/Something went wrong/)).toBeVisible();
  await expect(getSubmit(page)).toBeEnabled();
});
