// Mirrors the onboarding page at /app
// so /en/app, /am/app, etc. all work.

import Onboarding from "@/app/app/page";

export default function LocalizedOnboarding() {
  return <Onboarding />;
}
