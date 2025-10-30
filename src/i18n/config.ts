export const locales = ['en', 'am', 'om'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';
