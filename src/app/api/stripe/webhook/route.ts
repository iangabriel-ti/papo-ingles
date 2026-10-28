import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, grantPixYear, syncSubscription } from "@/lib/stripe";

// O Stripe avisa aqui quando um pagamento é aprovado, renovado ou cancelado.
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Pagamentos não configurados." }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Assinatura do webhook inválida." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          await syncSubscription(await stripe.subscriptions.retrieve(id));
        } else if (session.mode === "payment") {
          await grantPixYear(session);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
    }
  } catch (error) {
    // Erro 500 faz o Stripe tentar de novo mais tarde.
    console.error(`Stripe webhook ${event.type} failed:`, error);
    return NextResponse.json({ error: "Falha ao processar o evento." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
