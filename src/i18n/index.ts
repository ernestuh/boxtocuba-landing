import en from './en.json';
import es from './es.json';
import fr from './fr.json';

export type Lang = 'en' | 'es' | 'fr';

const translations = { en, es, fr } as const;

export function useTranslations(lang: Lang) {
  return function t(key: string): any {
    return key.split('.').reduce((obj: any, k) => obj?.[k], translations[lang]) ?? key;
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'es' || lang === 'fr') return lang;
  return 'en';
}
