// src/app/api/health/site-counts/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // never cache
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const { searchParams } = new URL(req.url);
  const simple = searchParams.get("simple") === "1";
  // Base response (useful for debugging in dev)
  const result: any = {
    ok: false,
    env: {
      url_present: Boolean(url),
      anon_present: Boolean(anon),
      url_sample: url ? url.replace(/^https?:\/\//, "").slice(0, 22) + "..." : null,
    },
    httpStatus: null,
    raw: null,
    parsed: null,
    note:
      "This endpoint calls public.site_counts via Supabase REST RPC with anon key. Add ?simple=1 to get {textbooks,attempts,users}.",
  };

  if (!url || !anon) {
    result.note = "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.";
    return NextResponse.json(simple ? { textbooks: 0, attempts: 0, users: 0 } : result, {
      status: 200,
    });
  }

  try {
    const res = await fetch(`${url}/rest/v1/rpc/site_counts`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
        "Accept-Profile": "public",
        "Content-Profile": "public",
      },
      body: JSON.stringify({}), // RPC needs a JSON body, even if empty
      cache: "no-store",
    });

    result.httpStatus = res.status;
    const text = await res.text();
    result.raw = text;

    try {
      result.parsed = JSON.parse(text);
    } catch {
      result.parsed = null;
    }

    result.ok = res.ok;

    if (simple) {
      const row = Array.isArray(result.parsed) ? result.parsed[0] : result.parsed || {};
      return NextResponse.json(
        {
          textbooks: Number(row?.textbooks ?? 0),
          attempts: Number(row?.attempts ?? 0),
          users: Number(row?.users ?? 0),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    result.note = e?.message || "Fetch error";
    return NextResponse.json(simple ? { textbooks: 0, attempts: 0, users: 0 } : result, {
      status: 200,
    });
  }
}
