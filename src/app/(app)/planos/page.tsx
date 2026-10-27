"use client";

import { Mascot } from "@/components/Mascot";
import { PricingCards } from "@/components/PricingCards";
import { lessonsLeftToday, useProgress } from "@/lib/progress";

export default function PlansPage() {
  const { progress } = useProgress();
  const outOfLessons = lessonsLeftToday(progress) === 0;

  return (
    <div className="px-4 pt-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-fuchsia-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <Mascot size={96} mood="celebrate" className="shrink-0" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Papo Super</p>
            <h1 className="text-2xl font-black leading-tight">
              {outOfLessons ? "Suas lições grátis de hoje acabaram" : "Aprenda sem limites"}
            </h1>
            <p className="mt-1 text-sm font-semibold opacity-90">
              {outOfLessons
                ? "Volte amanhã ou assine o Super para continuar agora mesmo."
                : "Lições ilimitadas, conversa livre e relatórios completos."}
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
