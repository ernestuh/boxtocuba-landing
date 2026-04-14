/**
 * Landing CMS: fetches content from Supabase settings at build time.
 * Falls back to bundled JSON translations if Supabase is unavailable or key is missing.
 */
import { createClient } from '@supabase/supabase-js';
import type { Lang } from '../i18n';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import fr from '../i18n/fr.json';

const fallbacks = { en, es, fr } as const;

type TranslationData = typeof en;

const SECTIONS = [
  'META', 'HERO', 'CUBA_BANNER', 'FEATURES', 'HOW_IT_WORKS', 'FAQ', 'CONTACT', 'FOOTER',
] as const;
type Section = (typeof SECTIONS)[number];

/** Map from CMS section name to i18n JSON key */
const SECTION_TO_KEY: Record<Section, keyof TranslationData> = {
  META: 'meta',
  HERO: 'hero',
  CUBA_BANNER: 'cuba_banner',
  FEATURES: 'features',
  HOW_IT_WORKS: 'how_it_works',
  FAQ: 'faq',
  CONTACT: 'contact',
  FOOTER: 'footer',
};

/**
 * Fetch CMS content for a given language from Supabase.
 * Merges Supabase values over the JSON fallback so partial overrides work.
 */
export async function getCmsContent(lang: Lang): Promise<TranslationData> {
  const base: TranslationData = JSON.parse(JSON.stringify(fallbacks[lang]));

  // Guard: skip Supabase fetch if env vars are missing (falls back to JSON)
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[CMS] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — using JSON fallback.');
    return base;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const prefix = `LANDING_${lang.toUpperCase()}_`;
    const keys = SECTIONS.map((s) => `${prefix}${s}`);

    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', keys);

    if (error || !data) {
      console.warn(`[CMS] Supabase fetch failed for lang=${lang}:`, error?.message);
      return base;
    }

    for (const row of data) {
      const section = row.key.replace(prefix, '') as Section;
      const jsonKey = SECTION_TO_KEY[section];
      if (!jsonKey) continue;
      try {
        (base as any)[jsonKey] = JSON.parse(row.value);
      } catch {
        console.warn(`[CMS] Failed to parse JSON for key=${row.key}`);
      }
    }
  } catch (err) {
    console.warn('[CMS] Unexpected error, using fallback:', err);
  }

  return base;
}

/**
 * Simple accessor: t(content, 'hero.headline')
 */
export function t(content: TranslationData, path: string): any {
  return path.split('.').reduce((obj: any, k) => obj?.[k], content) ?? path;
}
