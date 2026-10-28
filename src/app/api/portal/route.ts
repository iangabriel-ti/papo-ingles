import { NextResponse } from "next/server";
import { getCurrentUser, getProfile } from "@/lib/account";
import { siteUrl } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

// Abre o portal do Stripe, onde o aluno troca o cartão ou cancela a assinatura.
export async function POST(request: Request) {
  const stripe = getStripe();
  const user = await getCurrentUser();
  if (!stripe || !user) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }
  const profile = await getProfile(user.id);
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "Você ainda não tem uma assinatura." }, { status: 404 });
  }
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      locale: "pt-BR",
      return_url: `${siteUrl(request)}/perfil`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal failed:", error);
    return NextResponse.json({ error: "Não consegui abrir o portal de assinatura." }, { status: 502 });
  }
}
