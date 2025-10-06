import { NextRequest } from "next/server";
import { signedPdfUrl } from "@/core/textbooks";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) {
    return new Response("Missing path", { status: 400 });
  }
  try {
    const url = await signedPdfUrl(path);
    redirect(url); // 307 to signed URL
  } catch (e: any) {
    return new Response("Failed to sign URL: " + (e?.message ?? "unknown"), { status: 500 });
  }
}
