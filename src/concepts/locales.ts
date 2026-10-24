export const locales = ['en', 'de', 'ru'] as const;
export type Locale = (typeof locales)[number];
