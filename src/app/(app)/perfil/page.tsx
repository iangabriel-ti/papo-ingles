"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/Mascot";
import { DAILY_GOALS } from "@/lib/config";
import { LEVEL_INFO } from "@/lib/levels";
import { PATH } from "@/lib/path";
import { daysAgo, resetProgress, useProgress, type Progress } from "@/lib/progress";
import { getScenario, UNITS } from "@/lib/scenarios";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function achievements(p: Progress) {
  const conversations = p.sessions.filter((s) => s.kind === "conversation").length;
  const lessons = p.sessions.filter((s) => s.kind === "exercises").length;
  const unitsDone = UNITS.filter((u) => PATH.filter((n) => n.unit.level === u.level).every((n) => p.completed[n.id])).length;
  const bestScore = Math.max(0, ...p.sessions.filter((s) => s.kind === "conversation").map((s) => s.score ?? 0));
  return [
    { icon: "🐣", title: "Primeiros passos", text: "Conclua sua primeira atividade", value: p.sessions.length, goal: 1 },
    { icon: "🔥", title: "Em chamas", text: "Alcance uma ofensiva de 7 dias", value: p.bestStreak, goal: 7 },
    { icon: "🦜", title: "Tagarela", text: "Complete 10 conversas", value: conversations, goal: 10 },
    { icon: "📚", title: "Estudioso", text: "Complete 20 lições", value: lessons, goal: 20 },
    { icon: "💎", title: "Colecionador", text: "Junte 50 palavras no vocabulário", value: p.vocabulary.length, goal: 50 },
    { icon: "⭐", title: "Nota alta", text: "Tire 90 ou mais numa conversa", value: bestScore >= 90 ? 1 : 0, goal: 1 },
    { icon: "🏆", title: "Mestre", text: "Conclua uma unidade inteira", value: unitsDone, goal: 1 },
  ];
}

export default function ProfilePage() {
  const router = useRouter();
  const { progress, update } = useProgress();
  const level = progress.level ?? "A1";

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = daysAgo(6 - i);
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return { day, label: WEEKDAYS[date.getDay()], xp: progress.xpByDay[day] ?? 0 };
  });
  const maxXp = Math.max(progress.dailyGoal, ...week.map((d) => d.xp));

  return (
    <div className="space-y-8 px-4 pt-6">
      <section className="flex items-center gap-5 border-b-2 border-line pb-8">
        <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-brand-200 bg-brand-50">
          <Mascot size={78} />
        </div>
        <div>
          <h1 className="text-2xl font-black">{progress.name || "Estudante"}</h1>
          <p className="font-semibold text-muted">
            Nível {level} · {LEVEL_INFO[level].name}
          </p>
          <p className="mt-1 text-sm font-bold text-brand-500">{progress.plan === "premium" ? "⭐ Papo Super" : "Plano grátis"}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🔥", value: progress.streak, label: "Dias de ofensiva" },
            { icon: "⚡", value: progress.xp, label: "Total de XP" },
            { icon: "🏅", value: progress.bestStreak, label: "Maior ofensiva" },
            { icon: "✅", value: progress.sessions.length, label: "Atividades concluídas" },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-3 p-4">
              <span className="text-2xl">{s.icon}</span>
              <span>
                <span className="block text-xl font-black">{s.value}</span>
                <span className="block text-sm font-semibold text-muted">{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Últimos 7 dias</h2>
        <div className="card p-5">
          <div className="flex h-36 items-end justify-between gap-2">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-muted">{d.xp || ""}</span>
                <div
                  className={`w-full max-w-9 rounded-t-lg ${d.xp >= progress.dailyGoal ? "bg-amber-400" : "bg-brand-300"}`}
                  style={{ height: `${Math.max(4, (d.xp / maxXp) * 100)}px` }}
                />
                <span className="text-xs font-extrabold text-muted">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-muted">Barras douradas: dias em que você bateu a meta de {progress.dailyGoal} XP.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">Conquistas</h2>
        <div className="card divide-y-2 divide-line">
          {achievements(progress).map((a) => {
            const done = a.value >= a.goal;
            return (
              <div key={a.title} className="flex items-center gap-4 p-4">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl ${done ? "bg-amber-100" : "bg-line grayscale"}`}>{a.icon}</span>
                <div className="flex-1">
                  <p className="font-extrabold">{a.title}</p>
                  <p className="text-sm font-semibold text-muted">{a.text}</p>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (a.value / a.goal) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-black text-muted">
                  {Math.min(a.value, a.goal)}/{a.goal}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {progress.sessions.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-black">Histórico</h2>
          <div className="card divide-y-2 divide-line">
            {progress.sessions.slice(0, 10).map((s) => {
              const scenario = getScenario(s.scenarioId);
              return (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{s.kind === "conversation" ? "🎙️" : scenario?.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-extrabold">
                      {s.kind === "conversation" ? "Conversa" : "Lição"}: {scenario?.title}
                    </span>
                    <span className="block text-sm font-semibold text-muted">{new Date(s.date).toLocaleDateString("pt-BR")}</span>
                  </span>
                  <span className="text-right text-sm font-black">
                    {s.score !== null && <span className="block text-ok-dark">{s.score}%</span>}
                    <span className="block text-amber-500">+{s.xp} XP</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-black">Configurações</h2>
        <div className="card divide-y-2 divide-line">
          <label className="flex items-center justify-between gap-4 p-4 font-bold">
            Seu nome
            <input
              value={progress.name}
              onChange={(e) => update((p) => ({ ...p, name: e.target.value.slice(0, 40) }))}
              placeholder="Como o Kiko te chama?"
              className="w-44 rounded-xl border-2 border-line px-3 py-2 text-right font-semibold outline-none focus:border-brand-300"
            />
          </label>
          <label className="flex items-center justify-between gap-4 p-4 font-bold">
            Meta diária
            <select
              value={progress.dailyGoal}
              onChange={(e) => update((p) => ({ ...p, dailyGoal: Number(e.target.value) }))}
              className="rounded-xl border-2 border-line px-3 py-2 font-semibold"
            >
              {DAILY_GOALS.map((g) => (
                <option key={g.xp} value={g.xp}>
                  {g.label} · {g.xp} XP
                </option>
              ))}
            </select>
          </label>
          {(
            [
              ["sounds", "Efeitos sonoros"],
              ["autoPlayAudio", "Kiko fala as respostas em voz alta"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-4 p-4 font-bold">
              {label}
              <input
                type="checkbox"
                checked={progress.settings[key]}
                onChange={(e) => update((p) => ({ ...p, settings: { ...p.settings, [key]: e.target.checked } }))}
                className="h-6 w-6 accent-brand-500"
              />
            </label>
          ))}
          <Link href="/nivelamento" className="block p-4 font-bold text-brand-600 hover:bg-black/[0.02]">
            Refazer o teste de nivelamento
          </Link>
          <button
            onClick={() => {
              if (confirm("Apagar todo o seu progresso neste navegador?")) {
                resetProgress();
                router.push("/");
              }
            }}
            className="block w-full p-4 text-left font-bold text-bad hover:bg-black/[0.02]"
          >
            Apagar meu progresso
          </button>
        </div>
      </section>
    </div>
  );
}
