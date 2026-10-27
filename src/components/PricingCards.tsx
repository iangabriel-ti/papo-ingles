"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS } from "@/lib/config";
import { useProgress } from "@/lib/progress";

export function PricingCards({ startHref = "/aprender" }: { startHref?: string }) {
  const { progress, update } = useProgress();
  const [notice, setNotice] = useState(false);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border-2 border-b-4 bg-white p-6 ${
              plan.highlight ? "border-brand-500" : "border-line"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3.5 left-6 rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 px-3 py-1 text-xs font-black uppercase text-white">
                Mais escolhido
              </span>
            )}
            <h3 className="font-black">{plan.name}</h3>
            <p className="mt-3">
              <span className="text-3xl font-black">{plan.price}</span>{" "}
              <span className="text-sm font-semibold text-muted">{plan.period}</span>
            </p>
            <ul className="mt-5 flex-1 space-y-2 text-sm font-semibold">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="font-black text-ok">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            {plan.id === "free" ? (
              <Link href={startHref} className="btn btn-white mt-6">
                Começar grátis
              </Link>
            ) : (
              <button onClick={() => setNotice(true)} className={`btn mt-6 ${plan.highlight ? "btn-primary" : "btn-white"}`}>
                Assinar
              </button>
            )}
          </div>
        ))}
      </div>

      {notice && (
        <div className="animate-pop mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <p className="font-extrabold">O pagamento ainda não está ativo nesta versão.</p>
          <p className="mt-1 text-sm font-semibold text-muted">
            Para testar os recursos do Super enquanto isso, ative o modo de demonstração neste navegador.
          </p>
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
