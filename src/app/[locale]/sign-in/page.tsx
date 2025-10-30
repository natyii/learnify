// Mirrors the non-localized sign-in page at /sign-in
// so /en/sign-in, /am/sign-in, etc. all work.

import SignIn from "@/app/sign-in/page";

export default function LocalizedSignIn() {
  return <SignIn />;
}
