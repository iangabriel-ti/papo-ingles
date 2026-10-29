"use client";

import { Mascot } from "@/components/Mascot";
import { PricingCards } from "@/components/PricingCards";
import { lessonsLeftToday, useProgress } from "@/lib/progress";

export default function PlansPage() {
  const { progress } = useProgress();
  const outOfLessons = lessonsLeftToday(progress) === 0;

  return (
    <div className="px-4 pt-6">
      <div className="overflow-hidden rounded-3xl bg-brand-500 p-6 text-paper">
        <div className="flex items-center gap-4">
          <Mascot hat size={96} mood="celebrate" className="shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Papo Super</p>
            <h1 className="font-display text-2xl font-extrabold leading-tight">
              {outOfLessons ? "Suas lições grátis de hoje acabaram" : "Viaje sem limites"}
            </h1>
            <p className="mt-1 text-sm text-brand-100">
              {outOfLessons
                ? "Volte amanhã ou assine o Super para continuar agora mesmo."
                : "Lições ilimitadas, conversa livre e 7 dias grátis para testar."}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <PricingCards />
      </div>
    </div>
  );
}
