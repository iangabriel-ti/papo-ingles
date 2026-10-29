"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BookIcon, ChatIcon, FlameIcon, MicIcon, PassportIcon, PencilIcon, PlaneIcon, StarIcon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { Stamp } from "@/components/Stamp";
import { formatDate, openBillingPortal } from "@/lib/billing";
import { DAILY_GOALS } from "@/lib/config";
import { LEVEL_INFO } from "@/lib/levels";
import { PATH } from "@/lib/path";
import { daysAgo, EMPTY_PROGRESS, resetProgress, useProgress, type Progress } from "@/lib/progress";
import { getScenario, UNITS } from "@/lib/scenarios";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function achievements(p: Progress) {
  const conversations = p.sessions.filter((s) => s.kind === "conversation").length;
  const lessons = p.sessions.filter((s) => s.kind === "exercises").length;
  const unitsDone = UNITS.filter((u) => PATH.filter((n) => n.unit.level === u.level).every((n) => p.completed[n.id])).length;
  const bestScore = Math.max(0, ...p.sessions.filter((s) => s.kind === "conversation").map((s) => s.score ?? 0));
  return [
    { Icon: PlaneIcon, title: "Decolagem", text: "Conclua sua primeira atividade", value: p.sessions.length, goal: 1 },
    { Icon: FlameIcon, title: "Em chamas", text: "Alcance uma ofensiva de 7 dias", value: p.bestStreak, goal: 7 },
    { Icon: ChatIcon, title: "Tagarela", text: "Complete 10 conversas", value: conversations, goal: 10 },
    { Icon: PencilIcon, title: "Estudioso", text: "Complete 20 lições", value: lessons, goal: 20 },
    { Icon: BookIcon, title: "Colecionador", text: "Junte 50 palavras", value: p.vocabulary.length, goal: 50 },
    { Icon: StarIcon, title: "Nota alta", text: "Tire 90 ou mais numa conversa", value: bestScore >= 90 ? 1 : 0, goal: 1 },
    { Icon: PassportIcon, title: "Cidadão do mundo", text: "Complete uma cidade inteira", value: unitsDone, goal: 1 },
  ];
}

export default function ProfilePage() {
  const router = useRouter();
  const { progress, update } = useProgress();
  const auth = useAuth();
  const [billingError, setBillingError] = useState<string | null>(null);
  const level = progress.level ?? "A1";
  const entitlement = auth.account?.entitlement;

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = daysAgo(6 - i);
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return { day, label: WEEKDAYS[date.getDay()], xp: progress.xpByDay[day] ?? 0 };
  });
  const maxXp = Math.max(progress.dailyGoal, ...week.map((d) => d.xp));

  return (
    <div className="space-y-8 px-4 pt-6">
      {/* capa do passaporte */}
      <section className="overflow-hidden rounded-3xl bg-brand-500 text-paper">
        <div className="flex items-center gap-4 p-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-600">
            <Mascot hat size={64} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Passaporte Papo</p>
            <h1 className="truncate font-display text-2xl font-bold">{progress.name || "Viajante"}</h1>
            <p className="text-sm text-brand-100">
              Nível {level} · {LEVEL_INFO[level].name} · {progress.plan === "premium" ? "Super" : "Plano grátis"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 border-t border-dashed border-brand-300/50 bg-brand-600 text-center">
          {[
            { value: progress.streak, label: "ofensiva" },
            { value: progress.xp, label: "XP" },
            { value: Object.keys(progress.completed).length, label: "carimbos" },
            { value: progress.vocabulary.length, label: "palavras" },
          ].map((s) => (
            <div key={s.label} className="px-2 py-3">
              <p className="font-display text-xl font-bold">{s.value}</p>
              <p className="text-xs text-brand-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* páginas de carimbos */}
      <section>
        <h2 className="heading mb-3 text-xl">Carimbos</h2>
        <div className="card grid grid-cols-5 gap-2 p-4">
          {UNITS.map((unit) => {
            const nodes = PATH.filter((n) => n.unit.level === unit.level);
            const done = nodes.filter((n) => progress.completed[n.id]).length;
            const state = done === nodes.length ? "done" : done > 0 ? "current" : "locked";
            return (
              <div key={unit.level} className="flex flex-col items-center gap-1.5 text-center">
                <Stamp code={unit.code} state={state} size={52} />
                <span className="text-xs font-semibold">{unit.city}</span>
                <span className="text-[11px] text-muted">
                  {done}/{nodes.length}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="heading mb-3 text-xl">Últimos 7 dias</h2>
        <div className="card p-5">
          <div className="flex h-36 items-end justify-between gap-2">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-muted">{d.xp || ""}</span>
                <div
                  className={`w-full max-w-9 rounded-t-lg ${d.xp >= progress.dailyGoal ? "bg-sun-500" : "bg-brand-300"}`}
                  style={{ height: `${Math.max(4, (d.xp / maxXp) * 100)}px` }}
                />
                <span className="text-xs font-semibold text-muted">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Barras laranja: dias em que você bateu a meta de {progress.dailyGoal} XP.</p>
        </div>
      </section>

      <section>
        <h2 className="heading mb-3 text-xl">Conquistas</h2>
        <div className="card divide-y divide-line">
          {achievements(progress).map((a) => {
            const done = a.value >= a.goal;
            return (
              <div key={a.title} className="flex items-center gap-4 p-4">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-dashed ${
                    done ? "border-ok bg-ok-soft text-ok" : "border-[#cdc3b2] bg-sand text-[#8a8270]"
                  }`}
                >
                  <a.Icon size={22} />
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted">{a.text}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-sun-500" style={{ width: `${Math.min(100, (a.value / a.goal) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-muted">
                  {Math.min(a.value, a.goal)}/{a.goal}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {progress.sessions.length > 0 && (
        <section>
          <h2 className="heading mb-3 text-xl">Histórico</h2>
          <div className="card divide-y divide-line">
            {progress.sessions.slice(0, 10).map((s) => {
              const scenario = getScenario(s.scenarioId);
              return (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                    {s.kind === "conversation" ? <MicIcon size={18} /> : <PencilIcon size={18} />}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">
                      {s.kind === "conversation" ? "Conversa" : "Lição"}: {scenario?.title}
                    </span>
                    <span className="block text-sm font-semibold text-muted">{new Date(s.date).toLocaleDateString("pt-BR")}</span>
                  </span>
                  <span className="text-right text-sm font-bold">
                    {s.score !== null && <span className="block text-ok-dark">{s.score}%</span>}
                    <span className="block text-sun-700">+{s.xp} XP</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {auth.enabled && auth.account && (
        <section>
          <h2 className="heading mb-3 text-xl">Conta</h2>
          <div className="card divide-y divide-line">
            <div className="flex items-center justify-between gap-4 p-4 font-bold">
              E-mail
              <span className="truncate font-semibold text-muted">{auth.account.user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4 p-4 font-bold">
              Plano
              <span className="text-right font-semibold text-muted">
                {entitlement?.premium
                  ? entitlement.source === "pix"
                    ? `Super anual até ${formatDate(entitlement.premiumUntil)}`
                    : `Super · renova em ${formatDate(entitlement.premiumUntil)}`
                  : "Grátis"}
              </span>
            </div>
            {auth.account.hasStripeCustomer && entitlement?.source !== "pix" ? (
              <button
                onClick={async () => setBillingError(await openBillingPortal())}
                className="block w-full p-4 text-left font-bold text-brand-600 hover:bg-black/[0.02]"
              >
                Gerenciar assinatura e pagamentos
              </button>
            ) : (
              !entitlement?.premium && (
                <Link href="/planos" className="block p-4 font-bold text-brand-600 hover:bg-black/[0.02]">
                  Conhecer o Papo Super
                </Link>
              )
            )}
            {billingError && <p className="p-4 text-sm font-bold text-bad">{billingError}</p>}
            <button
              onClick={() => auth.signOut()}
              className="block w-full p-4 text-left font-bold text-muted hover:bg-black/[0.02]"
            >
              Sair da conta
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="heading mb-3 text-xl">Configurações</h2>
        <div className="card divide-y divide-line">
          <label className="flex items-center justify-between gap-4 p-4 font-bold">
            Seu nome
            <input
              value={progress.name}
              onChange={(e) => update((p) => ({ ...p, name: e.target.value.slice(0, 40) }))}
              placeholder="Como o Kiko te chama?"
              className="w-44 rounded-xl border border-line px-3 py-2 text-right font-semibold outline-none focus:border-brand-300"
            />
          </label>
          <label className="flex items-center justify-between gap-4 p-4 font-bold">
            Meta diária
            <select
              value={progress.dailyGoal}
              onChange={(e) => update((p) => ({ ...p, dailyGoal: Number(e.target.value) }))}
              className="rounded-xl border border-line px-3 py-2 font-semibold"
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
              if (confirm("Apagar todo o seu progresso? Isso não pode ser desfeito.")) {
                if (auth.enabled && auth.userId) {
                  // Zera também no servidor, mantendo a conta.
                  update((p) => ({ ...EMPTY_PROGRESS, ownerId: p.ownerId, plan: p.plan }));
                } else {
                  resetProgress();
                }
                router.push(auth.enabled ? "/comecar" : "/");
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
