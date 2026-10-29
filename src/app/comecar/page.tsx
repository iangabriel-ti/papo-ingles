"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonTopBar } from "@/components/LessonParts";
import { GoalChart } from "@/components/GoalChart";
import { MapIcon } from "@/components/Icons";
import { Mascot, MascotSays } from "@/components/Mascot";
import { Stamp } from "@/components/Stamp";
import { DAILY_GOALS, MASCOT_NAME, MOTIVATIONS } from "@/lib/config";
import { useProgress } from "@/lib/progress";
import { playSound } from "@/lib/sounds";

const STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { progress, update } = useProgress();
  const [step, setStep] = useState(0);
  const [motivation, setMotivation] = useState<string | null>(progress.motivation);
  const [goal, setGoal] = useState<number | null>(null);
  const [start, setStart] = useState<"zero" | "test" | null>(null);

  const canContinue = step === 0 || (step === 1 && motivation) || (step === 2 && goal) || (step === 3 && start);

  const next = () => {
    playSound("tap");
    if (step < STEPS - 1) {
      setStep(step + 1);
      return;
    }
    update((p) => ({
      ...p,
      motivation,
      dailyGoal: goal ?? p.dailyGoal,
      ...(start === "zero" ? { level: "A1" as const, onboarded: true } : {}),
    }));
    router.push(start === "zero" ? "/aprender" : "/nivelamento");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <LessonTopBar progress={(step + 1) / STEPS} onClose={() => (step > 0 ? setStep(step - 1) : router.push("/"))} />

      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-32 pt-10">
        {step === 0 && (
          <div className="pt-10 text-center">
            <Mascot hat size={170} mood="talking" className="animate-bob mx-auto" />
            <h1 className="heading mt-8 text-3xl">Oi! Eu sou o {MASCOT_NAME}.</h1>
            <p className="mt-3 text-lg text-muted">
              Sou a arara que vai viajar o mundo com você enquanto você aprende a falar inglês de verdade. Antes de embarcar, me conta umas coisinhas.
            </p>
          </div>
        )}

        {step === 1 && (
          <>
            <MascotSays>Por que você quer aprender inglês?</MascotSays>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {MOTIVATIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMotivation(m.id)}
                  className={`option flex items-center gap-3 ${motivation === m.id ? "option-selected" : ""}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <MascotSays>Qual vai ser a sua meta diária?</MascotSays>
            <div className="mt-8 grid gap-3">
              {DAILY_GOALS.map((g) => (
                <button
                  key={g.xp}
                  onClick={() => setGoal(g.xp)}
                  className={`option flex items-center justify-between ${goal === g.xp ? "option-selected" : ""}`}
                >
                  <span>{g.minutes} min por dia</span>
                  <span className="text-muted">{g.label}</span>
                </button>
              ))}
            </div>
            {goal && (
              <div className="mt-6">
                <GoalChart selectedXp={goal} onSelect={setGoal} />
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <MascotSays>Quanto inglês você já sabe?</MascotSays>
            <div className="mt-8 grid gap-3">
              <button onClick={() => setStart("zero")} className={`option flex items-center gap-4 py-4 ${start === "zero" ? "option-selected" : ""}`}>
                <Stamp code="NY" state="current" size={48} />
                <span>
                  <span className="block font-semibold">Estou começando agora</span>
                  <span className="block text-sm text-muted">Começar por Nova York (A1)</span>
                </span>
              </button>
              <button onClick={() => setStart("test")} className={`option flex items-center gap-4 py-4 ${start === "test" ? "option-selected" : ""}`}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                  <MapIcon size={24} />
                </span>
                <span>
                  <span className="block font-semibold">Já sei um pouco</span>
                  <span className="block text-sm text-muted">Fazer o teste de nivelamento (3 min)</span>
                </span>
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-paper px-5 py-5">
        <div className="mx-auto flex max-w-xl justify-end">
          <button onClick={next} disabled={!canContinue} className="btn btn-primary w-full sm:w-auto sm:min-w-44">
            Continuar
          </button>
        </div>
      </footer>
    </div>
  );
}
