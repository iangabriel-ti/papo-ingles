import "server-only";
import Stripe from "stripe";
import { getSupabaseAdmin } from "./supabase/server";

let stripe: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe ??= new Stripe(key);
  return stripe;
}

export const billingEnabled = () =>
  Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_MONTHLY && process.env.STRIPE_PRICE_YEARLY);

export const pixEnabled = () => billingEnabled() && process.env.STRIPE_PIX_ENABLED === "true";

// Status em que o aluno mantém o acesso até o fim do período já pago.
const ACCESS_STATUSES: Stripe.Subscription.Status[] = ["active", "trialing", "past_due"];

// Data até quando a assinatura dá acesso (null = sem acesso).
export function subscriptionAccessUntil(subscription: Stripe.Subscription): string | null {
  if (!ACCESS_STATUSES.includes(subscription.status)) return null;
  const periodEnd = Math.max(0, ...subscription.items.data.map((item) => item.current_period_end));
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
}

// Copia o estado da assinatura do Stripe para o perfil do aluno.
export async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_until: subscriptionAccessUntil(subscription),
    })
    .eq("stripe_customer_id", customerId);
  if (error) throw error;
}

// Plano anual pago via Pix: soma 1 ano de acesso, uma única vez por pagamento.
export async function grantPixYear(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId || session.payment_status !== "paid") return;
  const admin = getSupabaseAdmin();

  const { error: insertError } = await admin.from("payments").insert({
    stripe_session_id: session.id,
    user_id: userId,
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "brl",
  });
  // Já processado (o Stripe pode reenviar o mesmo evento).
  if (insertError?.code === "23505") return;
  if (insertError) throw insertError;

  const { data: profile, error } = await admin.from("profiles").select("pix_until").eq("id", userId).single();
  if (error) throw error;
  const current = (profile as { pix_until: string | null }).pix_until;
  const start = current && new Date(current) > new Date() ? new Date(current) : new Date();
  start.setFullYear(start.getFullYear() + 1);

  const { error: updateError } = await admin.from("profiles").update({ pix_until: start.toISOString() }).eq("id", userId);
  if (updateError) throw updateError;
}
