import { redirect } from "next/navigation";
import { serverSupabase } from "@/core/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "/app";

  const supabase = await serverSupabase(); // <-- await
  const { data, error } = await supabase.auth.getUser();

  if (!error && data?.user) {
    redirect(to);
  } else {
    redirect(`/sign-in?next=${encodeURIComponent(to)}`);
  }
}
