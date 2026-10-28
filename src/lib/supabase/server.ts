import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../env";
import type { Database } from "./database.types";

// Cliente com a sessão do usuário (lê os cookies de login).
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o middleware renova a sessão.
        }
      },
    },
  });
}

// Cliente com a chave secreta: ignora as regras de acesso (RLS).
// Usado só no servidor, para assinaturas e limites de uso.
let admin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !secret) {
    throw new Error("SUPABASE_SECRET_KEY não configurada.");
  }
  admin ??= createClient<Database>(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
