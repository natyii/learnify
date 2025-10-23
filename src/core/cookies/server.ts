// src/core/cookies/server.ts
"use server";

import { cookies } from "next/headers";

export async function setServerCookie(name: string, value: string) {
  cookies().set(name, value, { path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getServerCookie(name: string): Promise<string | null> {
  return cookies().get(name)?.value ?? null;
}
