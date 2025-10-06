import { redirect } from "next/navigation";
import { serverSupabase } from "./supabase/server";

export async function getUser() {
  const supabase = await serverSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/sign-in");
  return user;
}
