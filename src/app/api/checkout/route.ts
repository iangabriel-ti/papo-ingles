import { NextResponse } from "next/server";
import { z } from "zod";
import { entitlementOf, getCurrentUser, getProfile } from "@/lib/account";
import { TRIAL_DAYS, YEARLY_PRICE_CENTS } from "@/lib/config";
import { siteUrl } from "@/lib/env";
import { billingEnabled, getStripe, pixEnabled } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const RequestSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  method: z.enum(["card", "pix"]).default("card"),
});

// Cria a página de pagamento do Stripe e devolve o link para o aluno.
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !billingEnabled()) {
    return NextResponse.json({ error: "Os pagamentos ainda não foram configurados." }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Entre na sua conta para assinar.", code: "login_required" }, { status: 401 });
  }
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }
  const { plan, method } = parsed.data;
  if (method === "pix" && (plan !== "yearly" || !pixEnabled())) {
    return NextResponse.json({ error: "Pix está disponível só no plano anual." }, { status: 400 });
  }

  const profile = await getProfile(user.id);
  const entitlement = entitlementOf(profile);
  if (entitlement.source === "subscription") {
    return NextResponse.json({ error: "Você já tem uma assinatura ativa." }, { status: 409 });
  }

  // Um cliente no Stripe por aluno, criado no primeiro pagamento.
  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = customer.id;
    } catch (error) {
      console.error("Stripe customer creation failed:", error);
      return NextResponse.json({ error: "Não consegui abrir o pagamento. Tente de novo." }, { status: 502 });
    }
    const { error } = await getSupabaseAdmin()
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
    if (error) {
      console.error("Saving Stripe customer failed:", error.message);
      return NextResponse.json({ error: "Não consegui iniciar o pagamento. Tente de novo." }, { status: 500 });
    }
  }

  const base = siteUrl(request);
  const common = {
    customer: customerId,
    client_reference_id: user.id,
    locale: "pt-BR" as const,
    success_url: `${base}/planos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/planos`,
  };

  try {
    const session =
      method === "pix"
        ? await stripe.checkout.sessions.create({
            ...common,
            mode: "payment",
            allowed_payment_method_types: ["pix"],
            payment_method_options: { pix: { expires_after_seconds: 3600 } },
            line_items: [
              {
                quantity: 1,
                price_data: {
                  currency: "brl",
                  unit_amount: YEARLY_PRICE_CENTS,
                  product_data: { name: "Papo Super Anual (12 meses)" },
                },
              },
            ],
          })
        : await stripe.checkout.sessions.create({
            ...common,
            mode: "subscription",
            allow_promotion_codes: true,
            // Teste grátis só na primeira assinatura, para ninguém repetir o período grátis.
            ...(profile?.stripe_subscription_id ? {} : { subscription_data: { trial_period_days: TRIAL_DAYS } }),
            line_items: [
              {
                quantity: 1,
                price: plan === "monthly" ? process.env.STRIPE_PRICE_MONTHLY! : process.env.STRIPE_PRICE_YEARLY!,
              },
            ],
          });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    return NextResponse.json({ error: "Não consegui abrir o pagamento. Tente de novo." }, { status: 502 });
  }
}
