// server-only cookie utilities
import 'server-only';
import { cookies } from 'next/headers';

export type CookieOptions = {
  path?: string;
  httpOnly?: boolean;
  sameSite?: 'lax'|'strict'|'none';
  secure?: boolean;
  maxAge?: number;
  expires?: Date;
};

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  cookies().set({ name, value, ...options });
}

export function deleteCookie(name: string, options: CookieOptions = {}) {
  cookies().set({ name, value: '', ...options, expires: new Date(0) });
}

export function getCookie(name: string) {
  return cookies().get(name)?.value ?? null;
}
