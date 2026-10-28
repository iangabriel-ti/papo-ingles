import { NextResponse } from "next/server";
import { entitlementOf, getCurrentUser, getProfile, getUsageToday } from "@/lib/account";
import { billingEnabled, pixEnabled } from "@/lib/stripe";

// Dados da conta: e-mail, plano e uso de hoje.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const [profile, usage] = await Promise.all([getProfile(user.id), getUsageToday(user.id)]);
  return NextResponse.json({
    user: { id: user.id, email: user.email },
    entitlement: entitlementOf(profile),
    hasStripeCustomer: Boolean(profile?.stripe_customer_id),
    lessonsToday: usage?.lessons ?? 0,
    billing: { enabled: billingEnabled(), pix: pixEnabled() },
  });
}
