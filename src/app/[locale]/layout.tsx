// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getMessages } from '@/i18n/getMessages';
import { locales, type Locale, defaultLocale } from '@/i18n/config';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Learnify'
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  // In Next 15, params is async in layouts
  params: Promise<{ locale: Locale }>;
}) {
  const { locale: raw } = await params;
  const locale = (raw ?? defaultLocale) as Locale;

  // Tell next-intl the active locale for this request
  unstable_setRequestLocale(locale);

  const messages = await getMessages(locale);

  // 🚫 No <html> or <body> here. Let the ROOT layout own them (fonts, classes, etc.)
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
