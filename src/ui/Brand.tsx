// src/ui/Brand.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type Props = {
  href?: string;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
};

export function LogoMark({
  href = "/",
  height = 36,
  className,
  priority = true,
  alt = "Brand logo",
}: Props) {
  const img = (
    <Image
      src="/brand/logo-text.png"
      alt={alt}
      width={Math.round(height * 3)} // rough aspect; adjust if your file is wider/narrower
      height={height}
      priority={priority}
      className="h-auto w-auto select-none"
    />
  );
  return href ? (
    <Link href={href} className={clsx("inline-flex items-center gap-2", className)}>
      {img}
    </Link>
  ) : (
    <span className={clsx("inline-flex items-center gap-2", className)}>{img}</span>
  );
}

export function LogoIcon({
  href = "/",
  height = 32,
  className,
  priority = false,
  alt = "Brand icon",
}: Props) {
  const img = (
    <Image
      src="/brand/logo-icon.png"
      alt={alt}
      width={height}
      height={height}
      priority={priority}
      className="h-auto w-auto rounded-md select-none"
    />
  );
  return href ? (
    <Link href={href} className={clsx("inline-flex items-center", className)}>
      {img}
    </Link>
  ) : (
    <span className={clsx("inline-flex items-center", className)}>{img}</span>
  );
}
