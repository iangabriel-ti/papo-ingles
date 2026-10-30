"use client";

import Link from "next/link";
import { REVIEW_ID, XP_REVIEW } from "@/lib/config";
import { lessonsLeftToday, pickReviewMaterial, reviewDoneToday, type Progress } from "@/lib/progress";
import { CheckIcon, TargetIcon } from "./Icons";

// Missão do dia: revisão personalizada com as palavras e os erros do próprio aluno.
export function DailyMission({ progress }: { progress: Progress }) {
  const material = pickReviewMaterial(progress);
  const done = reviewDoneToday(progress);
  const blocked = lessonsLeftToday(progress) === 0;
  const href = blocked ? "/planos" : `/licao/${REVIEW_ID}`;

  if (!material.available) {
    return (
      <section className="card mt-4 flex items-center gap-4 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sand text-[#8a8270]">
          <TargetIcon size={24} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-sun-700">Missão do dia</p>
          <p className="font-bold">Revisão personalizada</p>
          <p className="text-sm text-muted">Complete uma conversa e o Kiko monta uma revisão com as suas palavras e os seus erros.</p>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="card mt-4 flex items-center gap-4 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ok text-white">
          <CheckIcon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-ok-dark">Missão cumprida</p>
          <p className="font-bold">Revisão de hoje feita!</p>
          <p className="text-sm text-muted">Amanhã tem uma nova, com o que você praticou hoje.</p>
        </div>
        <Link href={href} className="shrink-0 text-sm font-bold text-brand-500 hover:underline">
          Revisar de novo
        </Link>
      </section>
    );
  }

  const parts = [
    material.words.length ? `${material.words.length} palavra${material.words.length > 1 ? "s" : ""}` : "",
    material.mistakes.length ? `${material.mistakes.length} erro${material.mistakes.length > 1 ? "s" : ""} para corrigir` : "",
  ].filter(Boolean);

  return (
    <section className="mt-4 rounded-3xl border-2 border-dashed border-sun-500 bg-white p-4">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sun-500 text-ink">
          <TargetIcon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-sun-700">Missão do dia · +{XP_REVIEW} XP</p>
          <p className="font-bold">Revisão personalizada</p>
          <p className="text-sm text-muted">{parts.join(" e ")} · cerca de 5 min</p>
        </div>
      </div>
      <Link href={href} className="btn btn-dark mt-3 w-full py-2.5">
        {blocked ? "Lições de hoje acabaram" : "Começar revisão"}
      </Link>
    </section>
  );
}
