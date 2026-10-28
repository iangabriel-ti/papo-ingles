// Quais serviços externos estão configurados. Sem o Supabase, o app roda em
// "modo demonstração" (sem login, progresso só no navegador), mas apenas em
// desenvolvimento: em produção as rotas de IA exigem login.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const authEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const demoModeAllowed = !authEnabled && process.env.NODE_ENV !== "production";

export function siteUrl(request?: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}
