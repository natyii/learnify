// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'am', 'om'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

// ✅ Explicit matcher that always runs for / and /<locale>/...
export const config = {
  matcher: ['/', '/(en|am|om)/:path*']
};
