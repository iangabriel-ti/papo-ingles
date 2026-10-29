"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, openBillingPortal, startCheckout, type CheckoutPlan } from "@/lib/billing";
import { PLANS, TRIAL_DAYS } from "@/lib/config";
import { demoModeAllowed } from "@/lib/env";
import { useProgress } from "@/lib/progress";
import { useAuth } from "./AuthProvider";
import { CheckIcon, StarIcon } from "./Icons";

export function PricingCards({ startHref = "/aprender" }: { startHref?: string }) {
  const { progress, update } = useProgress();
  const auth = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  const entitlement = auth.account?.entitlement;
  const billing = auth.account?.billing;
  const loggedIn = Boolean(auth.userId);

  const buy = async (plan: CheckoutPlan, method: "card" | "pix") => {
    setMessage(null);
    // Modo demonstração (sem Supabase, só em desenvolvimento).
    if (!auth.enabled) {
      setDemoNotice(true);
      return;
    }
    if (!loggedIn) {
      window.location.href = `/entrar?next=${encodeURIComponent("/planos")}`;
      return;
    }
    if (!billing?.enabled) {
      setMessage("Os pagamentos ainda não foram ativados. Volte em breve!");
      return;
    }
    setBusy(`${plan}-${method}`);
    const error = await startCheckout(plan, method);
    if (error) {
      setMessage(error);
      setBusy(null);
    }
  };

  const manage = async () => {
    setBusy("portal");
    const error = await openBillingPortal();
    if (error) {
      setMessage(error);
      setBusy(null);
    }
  };

  if (entitlement?.premium) {
    return (
      <div className="card border-b-4 p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sun-500 text-ink">
          <StarIcon size={28} />
        </span>
        <p className="heading mt-3 text-2xl">Você é Super!</p>
        <p className="mt-1 font-semibold text-muted">
          {entitlement.source === "pix"
            ? `Seu plano anual vale até ${formatDate(entitlement.premiumUntil)}.`
            : entitlement.subscriptionStatus === "past_due"
              ? "Não conseguimos cobrar seu cartão. Atualize a forma de pagamento para não perder o acesso."
              : `Sua assinatura renova em ${formatDate(entitlement.premiumUntil)}.`}
        </p>
        {entitlement.source === "subscription" && (
          <button onClick={manage} disabled={busy !== null} className="btn btn-white mt-6">
            {busy === "portal" ? "Abrindo…" : "Gerenciar assinatura"}
          </button>
        )}
        {message && <p className="mt-4 text-sm font-bold text-bad">{message}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
              plan.highlight ? "border-brand-500" : "border-line"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3.5 left-6 rounded-full bg-sun-500 text-ink px-3 py-1 text-xs font-bold uppercase text-white">
                Mais escolhido
              </span>
            )}
            <h3 className="font-display text-lg font-bold text-brand-500">{plan.name}</h3>
            <p className="mt-3">
              <span className="font-display text-3xl font-bold">{plan.price}</span>{" "}
              <span className="text-sm font-semibold text-muted">{plan.period}</span>
            </p>
            <ul className="mt-5 flex-1 space-y-2 text-sm font-semibold">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-ok" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.id === "free" ? (
              <Link href={startHref} className="btn btn-white mt-6">
                Começar grátis
              </Link>
            ) : (
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => buy(plan.id as CheckoutPlan, "card")}
                  disabled={busy !== null}
                  className={`btn ${plan.highlight ? "btn-primary" : "btn-white"}`}
                >
                  {busy === `${plan.id}-card` ? "Abrindo…" : `Testar ${TRIAL_DAYS} dias grátis`}
                </button>
                {plan.id === "yearly" && billing?.pix && (
                  <button onClick={() => buy("yearly", "pix")} disabled={busy !== null} className="btn btn-white">
                    {busy === "yearly-pix" ? "Abrindo…" : "Pagar com Pix"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-muted">
        Pagamento seguro pelo Stripe. O teste grátis vale na primeira assinatura no cartão; cancele antes do fim e não paga nada.
      </p>
      {message && <p className="mt-4 text-center text-sm font-bold text-bad">{message}</p>}

      {demoNotice && demoModeAllowed && (
        <div className="animate-pop mt-6 rounded-2xl border-2 border-sun-500 bg-sun-50 p-5">
          <p className="font-semibold">Modo demonstração: o pagamento não está configurado.</p>
          <p className="mt-1 text-sm font-semibold text-muted">Para testar os recursos do Super, ative-os neste navegador.</p>
          <button
            onClick={() => update((p) => ({ ...p, plan: p.plan === "premium" ? "free" : "premium" }))}
            className="btn btn-primary mt-4"
          >
            {progress.plan === "premium" ? "Voltar para o plano grátis" : "Ativar Super (demonstração)"}
          </button>
        </div>
      )}
    </div>
  );
}
