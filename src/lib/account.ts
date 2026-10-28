import "server-only";
import { NextResponse } from "next/server";
import { DAILY_AI_CALLS, FREE_DAILY_LESSONS } from "./config";
import { authEnabled, demoModeAllowed } from "./env";
import { getSupabaseAdmin, getSupabaseServer } from "./supabase/server";

export type Entitlement = {
  premium: boolean;
  premiumUntil: string | null;
  source: "subscription" | "pix" | null;
  subscriptionStatus: string | null;
};

export type ProfileRow = {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_until: string | null;
  pix_until: string | null;
};

export async function getCurrentUser() {
  if (!authEnabled) return null;
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await getSupabaseAdmin().from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export function entitlementOf(profile: ProfileRow | null, now = new Date()): Entitlement {
  const subscriptionUntil = profile?.subscription_until ? new Date(profile.subscription_until) : null;
  const pixUntil = profile?.pix_until ? new Date(profile.pix_until) : null;
  const subscriptionActive = subscriptionUntil !== null && subscriptionUntil > now;
  const pixActive = pixUntil !== null && pixUntil > now;

  // Quando os dois existem, vale a data mais distante.
  let source: Entitlement["source"] = null;
  let until: Date | null = null;
  if (subscriptionActive) [source, until] = ["subscription", subscriptionUntil];
  if (pixActive && (!until || pixUntil! > until)) [source, until] = ["pix", pixUntil];

  return {
    premium: source !== null,
    premiumUntil: until?.toISOString() ?? null,
    source,
    subscriptionStatus: profile?.subscription_status ?? null,
  };
}

// Mesmo dia usado no banco: horário de Brasília.
export function todayBrt() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export async function getUsageToday(userId: string) {
  const { data } = await getSupabaseAdmin()
    .from("daily_usage")
    .select("lessons, messages")
    .eq("user_id", userId)
    .eq("day", todayBrt())
    .maybeSingle();
  return data as { lessons: number; messages: number } | null;
}

// Verifica login e limites antes de chamar a IA, e registra o uso.
// Devolve uma resposta de erro pronta quando o pedido não pode seguir.
export async function guardAiRequest(use: {
  lessons: number;
  calls: number;
  premiumOnly?: boolean;
}): Promise<NextResponse | null> {
  if (!authEnabled) {
    return demoModeAllowed
      ? null
      : NextResponse.json({ error: "O login ainda não foi configurado neste servidor." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Entre na sua conta para continuar.", code: "login_required" }, { status: 401 });
  }

  const { premium } = entitlementOf(await getProfile(user.id));
  if (use.premiumOnly && !premium) {
    return NextResponse.json(
      { error: "A conversa livre é exclusiva do plano Super.", code: "limit_reached" },
      { status: 402 },
    );
  }
  const { data: allowed, error } = await getSupabaseAdmin().rpc("consume_usage", {
    p_user: user.id,
    p_lessons: use.lessons,
    p_messages: use.calls,
    p_lesson_limit: premium ? null : FREE_DAILY_LESSONS,
    p_message_limit: premium ? DAILY_AI_CALLS.premium : DAILY_AI_CALLS.free,
  });
  if (error) {
    console.error("consume_usage failed:", error.message);
    return NextResponse.json({ error: "Não consegui verificar seu plano. Tente de novo." }, { status: 500 });
  }
  if (!allowed) {
    return NextResponse.json(
      {
        error: premium
          ? "Você atingiu o limite de uso de hoje. Volte amanhã!"
          : "Suas lições grátis de hoje acabaram. Assine o Super para continuar.",
        code: "limit_reached",
      },
      { status: 402 },
    );
  }
  return null;
}

// Devolve o uso registrado quando a IA falha, para o aluno não perder a lição.
export async function refundAiUsage(use: { lessons: number; calls: number }) {
  if (!authEnabled) return;
  const user = await getCurrentUser();
  if (!user) return;
  const { error } = await getSupabaseAdmin().rpc("consume_usage", {
    p_user: user.id,
    p_lessons: -use.lessons,
    p_messages: -use.calls,
    p_lesson_limit: null,
    p_message_limit: null,
  });
  if (error) console.error("refund usage failed:", error.message);
}
