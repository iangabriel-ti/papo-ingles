"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Confetti } from "@/components/Confetti";
import { LessonTopBar } from "@/components/LessonParts";
import { Mascot, MascotSays } from "@/components/Mascot";
import { LEVEL_INFO, LEVELS, type Level } from "@/lib/levels";
import { levelFromAnswers, QUESTIONS } from "@/lib/placement";
import { useProgress } from "@/lib/progress";
import { UNITS } from "@/lib/scenarios";
import { playSound } from "@/lib/sounds";

export default function PlacementPage() {
  const router = useRouter();
  const { update } = useProgress();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Level | null>(null);

  const question = QUESTIONS[index];

  const next = (choice: number | null = selected) => {
    if (choice === null) return;
    playSound("tap");
    const all = [...answers, choice];
    setAnswers(all);
    setSelected(null);

    // Ao fim de cada nível (3 perguntas), para se o aluno não passou.
    const endOfBand = (index + 1) % 3 === 0;
    const band = QUESTIONS.slice(index - 2, index + 1);
    const correctInBand = band.filter((q, i) => all[index - 2 + i] === q.answer).length;
    if (index + 1 >= QUESTIONS.length || (endOfBand && correctInBand < 2)) {
      setResult(levelFromAnswers(all));
      playSound("complete");
    } else {
      setIndex(index + 1);
    }
  };

  const confirm = (level: Level) => {
    update((p) => ({ ...p, level, onboarded: true }));
    router.push("/aprender");
  };

  if (result) {
    const unit = UNITS.find((u) => u.level === result)!;
    return (
      <div className="flex min-h-dvh flex-col">
        <Confetti />
        <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-14 text-center">
          <Mascot mood="celebrate" size={150} className="animate-bob mx-auto" />
          <p className="mt-6 font-black uppercase tracking-widest text-muted">Seu nível</p>
          <h1 className={`mt-1 text-5xl font-black ${unit.color.text}`}>{result}</h1>
          <p className="mt-2 text-2xl font-extrabold">{LEVEL_INFO[result].name}</p>
          <p className="mt-3 font-semibold text-muted">{LEVEL_INFO[result].description}</p>
          <div className={`mt-8 rounded-2xl ${unit.color.soft} p-5 text-left`}>
            <p className="font-extrabold">Você vai começar pela {unit.title}</p>
            <p className="mt-1 text-sm font-semibold text-muted">
              As unidades anteriores ficam liberadas para você revisar quando quiser.
            </p>
          </div>
          <details className="mt-6 text-sm font-semibold text-muted">
            <summary className="cursor-pointer">Prefere escolher outro nível?</summary>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => confirm(l)} className="tile">
                  {l} · {LEVEL_INFO[l].name}
                </button>
              ))}
            </div>
          </details>
        </main>
        <footer className="sticky bottom-0 border-t-2 border-line bg-white px-5 py-5">
          <div className="mx-auto max-w-xl">
            <button onClick={() => confirm(result)} className="btn btn-primary w-full">
              Começar a aprender
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <LessonTopBar progress={index / QUESTIONS.length} onClose={() => router.back()} />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-32 pt-8">
        <p className="text-sm font-black uppercase tracking-wide text-brand-500">Teste de nivelamento</p>
        <div className="mt-4">
          <MascotSays size={80}>{question.prompt}</MascotSays>
        </div>
        {question.sentence && <p className="mt-6 text-2xl font-bold">{question.sentence}</p>}
        <div className="mt-8 grid gap-3">
          {question.options.map((option, i) => (
            <button
              key={`${index}-${i}`}
              onClick={() => setSelected(i)}
              className={`option flex items-center gap-3 ${selected === i ? "option-selected" : ""}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-line text-xs font-black text-muted">
                {i + 1}
              </span>
              {option}
            </button>
          ))}
        </div>
      </main>
      <footer className="fixed inset-x-0 bottom-0 border-t-2 border-line bg-white px-5 py-5">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <button
            onClick={() => next(-1)}
            className="btn btn-white"
          >
            Não sei
          </button>
          <button onClick={() => next()} disabled={selected === null} className="btn btn-primary min-w-40">
            Continuar
          </button>
        </div>
      </footer>
    </div>
  );
}
