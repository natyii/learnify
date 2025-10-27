// src/ui/SiteFooter.tsx
"use client";

import Link from "next/link";
import { Mail, Phone, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="relative overflow-hidden">
        {/* gradient strip */}
        <div className="pointer-events-none absolute inset-0 opacity-90 [mask-image:linear-gradient(to_top,transparent,black_20%,black_80%,transparent)]" />
        <div className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-500">
          <div className="mx-auto max-w-6xl px-4 py-10 text-white">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold">Get in touch</h3>
                <p className="mt-2 text-white/80">
                  We’re here for parents and students across Ethiopia.
                </p>
                <div className="mt-4 space-y-2">
                  <a href="tel:+251912345678" className="flex items-center gap-2 hover:opacity-90">
                    <Phone className="size-4" />
                    <span>+251 91 234 5678</span>
                  </a>
                  <a href="mailto:hello@aitutor.et" className="flex items-center gap-2 hover:opacity-90">
                    <Mail className="size-4" />
                    <span>hello@aitutor.et</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Follow us</h3>
                <div className="mt-4 flex items-center gap-4">
                  <Link href="https://facebook.com/yourpage" className="rounded-md p-2 hover:bg-white/10">
                    <Facebook className="size-5" />
                  </Link>
                  <Link href="https://x.com/yourpage" className="rounded-md p-2 hover:bg-white/10">
                    <Twitter className="size-5" />
                  </Link>
                  <Link href="https://instagram.com/yourpage" className="rounded-md p-2 hover:bg-white/10">
                    <Instagram className="size-5" />
                  </Link>
                  <Link href="https://youtube.com/@yourpage" className="rounded-md p-2 hover:bg-white/10">
                    <Youtube className="size-5" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {/* icon-only logo in footer */}
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                  {/* if you prefer the real image, swap this div for <Image src="/brand/logo-icon.png" .../> */}
                  <div className="size-10 rounded-md bg-white/20" />
                </div>
                <div>
                  <div className="text-lg font-semibold">AI Tutor Ethiopia</div>
                  <div className="text-white/80">Made for Grades 1–12</div>
                  <div className="mt-2 text-sm text-white/70">
                    Addis Ababa • Amharic & English
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/20 pt-6 text-sm text-white/70">
              © {new Date().getFullYear()} AI Tutor Ethiopia. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
