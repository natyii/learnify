import { NextResponse } from "next/server";
import { signTextbookUrl } from "@/core/storage/sign";
import { toStorageKey } from "@/core/storage/keys";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("key") || "";
  try {
    const key = toStorageKey(raw);
    if (!key) {
      return new NextResponse("Bad request: missing ?key", { status: 400 });
    }
    const signed = await signTextbookUrl(key, { expiresIn: 60 * 10 });
    return NextResponse.redirect(signed, 302);
  } catch (e: any) {
    return new NextResponse(`Failed to sign URL: ${e.message || e}`, { status: 404 });
  }
}
