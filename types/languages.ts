export type LanguageCode = 'es' | 'en' | 'pt' | 'de';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'es';
