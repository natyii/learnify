// src/app/[locale]/page.tsx
import Landing from "@/ui/landing/Landing";

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // ✅ Next 15: params is async
  return <Landing locale={locale} />;
}
