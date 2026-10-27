"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonTopBar } from "@/components/LessonParts";
import { Mascot, MascotSays } from "@/components/Mascot";
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
            <Mascot size={170} mood="talking" className="animate-bob mx-auto" />
            <h1 className="mt-8 text-3xl font-black">Oi! Eu sou o {MASCOT_NAME}! 👋</h1>
            <p className="mt-3 text-lg font-semibold text-muted">
              Vou te ajudar a falar inglês de verdade, conversando comigo todos os dias. Só preciso saber algumas coisinhas antes.
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
                  <span className="text-2xl">{m.emoji}</span>
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
          </>
        )}

        {step === 3 && (
          <>
            <MascotSays>Quanto inglês você já sabe?</MascotSays>
            <div className="mt-8 grid gap-3">
              <button onClick={() => setStart("zero")} className={`option flex items-center gap-4 py-4 ${start === "zero" ? "option-selected" : ""}`}>
                <span className="text-3xl">🌱</span>
                <span>
                  <span className="block font-extrabold">Estou começando agora</span>
                  <span className="block text-sm font-semibold text-muted">Começar pela Unidade 1</span>
                </span>
              </button>
              <button onClick={() => setStart("test")} className={`option flex items-center gap-4 py-4 ${start === "test" ? "option-selected" : ""}`}>
                <span className="text-3xl">🧭</span>
                <span>
                  <span className="block font-extrabold">Já sei um pouco</span>
                  <span className="block text-sm font-semibold text-muted">Fazer o teste de nivelamento (3 min)</span>
                </span>
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t-2 border-line bg-white px-5 py-5">
        <div className="mx-auto flex max-w-xl justify-end">
          <button onClick={next} disabled={!canContinue} className="btn btn-primary w-full sm:w-auto sm:min-w-44">
            Continuar
          </button>
        </div>
      </footer>
    </div>
  );
}
