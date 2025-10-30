"use client";

import {usePathname, useRouter} from "next/navigation";
import {useLocale} from "next-intl";

const locales = [
  {code: "en", label: "English"},
  {code: "am", label: "አማርኛ"},
  {code: "om", label: "Afaan Oromoo"}
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value;
    // Replace the first segment of the current URL with the new locale
    const parts = pathname.split("/");
    parts[1] = newLocale;
    router.push(parts.join("/") || "/");
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {locales.map(l => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
