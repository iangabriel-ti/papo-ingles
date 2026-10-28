import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/env";
import { getSupabaseServer } from "@/lib/supabase/server";

// Volta do login com Google, da confirmação de e-mail e do link de nova senha.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/aprender";
  // Só aceita destinos internos, para o link não poder levar a outro site.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/aprender";
  const base = siteUrl(request);

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${safeNext}`);
  }
  return NextResponse.redirect(`${base}/entrar?erro=link`);
}
