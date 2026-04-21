/**
 * Landing CMS: fetches content from Supabase settings at build time.
 * Falls back to bundled JSON translations if Supabase is unavailable or key is missing.
 */
import { createClient } from '@supabase/supabase-js';

// ─── Service Notice ────────────────────────────────────────────────────────

export interface Notice {
  enabled: boolean;
  /** Provinces with no direct flights — delivery to provincial capital only */
  capital_only: string[];
  /** Provinces with no delivery — pickup at La Habana office */
  pickup_havana: string[];
  /** Provinces with no delivery — pickup at Santiago de Cuba office */
  pickup_santiago: string[];
}

export type NoticeType = 'capital_only' | 'pickup_havana' | 'pickup_santiago' | null;

const DEFAULT_NOTICE: Notice = {
  enabled: false,
  capital_only: [],
  pickup_havana: [],
  pickup_santiago: [],
};

/** Fetch the service notice config from Supabase. Returns disabled notice if unavailable. */
export async function getNotice(): Promise<Notice> {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return DEFAULT_NOTICE;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'LANDING_NOTICE')
      .single();

    if (error || !data) return DEFAULT_NOTICE;
    return JSON.parse(data.value) as Notice;
  } catch {
    return DEFAULT_NOTICE;
  }
}

// ─── Share Buttons Config ──────────────────────────────────────────────────

export interface ShareButtonsConfig {
  enabled: boolean;
}

const DEFAULT_SHARE_BUTTONS_CONFIG: ShareButtonsConfig = { enabled: false };

/** Fetch share buttons feature flag from Supabase. Falls back to disabled if unavailable. */
export async function getShareButtonsConfig(): Promise<ShareButtonsConfig> {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return DEFAULT_SHARE_BUTTONS_CONFIG;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'LANDING_SHARE_BUTTONS')
      .single();

    if (error || !data) return DEFAULT_SHARE_BUTTONS_CONFIG;
    return { ...DEFAULT_SHARE_BUTTONS_CONFIG, ...JSON.parse(data.value) } as ShareButtonsConfig;
  } catch {
    return DEFAULT_SHARE_BUTTONS_CONFIG;
  }
}

// ─── Navbar Config ─────────────────────────────────────────────────────────

export interface NavbarConfig {
  show_client_portal: boolean;
}

const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
  show_client_portal: true,
};

/** Fetch navbar feature flags from Supabase. Falls back to defaults if unavailable. */
export async function getNavbarConfig(): Promise<NavbarConfig> {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return DEFAULT_NAVBAR_CONFIG;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'LANDING_NAVBAR')
      .single();

    if (error || !data) return DEFAULT_NAVBAR_CONFIG;
    return { ...DEFAULT_NAVBAR_CONFIG, ...JSON.parse(data.value) } as NavbarConfig;
  } catch {
    return DEFAULT_NAVBAR_CONFIG;
  }
}

/** Returns the notice type for a given province slug, or null if no active notice. */
export function getProvinceNoticeType(notice: Notice, slug: string): NoticeType {
  if (!notice.enabled) return null;
  if (notice.capital_only.includes(slug)) return 'capital_only';
  if (notice.pickup_havana.includes(slug)) return 'pickup_havana';
  if (notice.pickup_santiago.includes(slug)) return 'pickup_santiago';
  return null;
}
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
