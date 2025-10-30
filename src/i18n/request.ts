import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './config';

export default getRequestConfig(async ({locale}) => {
  const normalized = (locales as readonly string[]).includes(locale) ? locale : defaultLocale;
  const messages = (await import(`./messages/${normalized}/common.json`)).default;
  return {locale: normalized, messages};
});
