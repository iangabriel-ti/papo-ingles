"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChatIcon, CheckIcon, ChevronRightIcon, LockIcon, MicIcon, PencilIcon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { Stamp } from "@/components/Stamp";
import { LEVEL_INFO } from "@/lib/levels";
import { currentNode, nodeHref, nodeStatuses, PATH, type NodeStatus, type PathNode } from "@/lib/path";
import { lessonsLeftToday, useProgress } from "@/lib/progress";
import { FREE_TALK, lessonsOf, UNITS } from "@/lib/scenarios";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

// Botão de uma etapa (lição ou conversa) dentro de uma parada do roteiro.
function StepChip({ node, status, blocked }: { node: PathNode; status: NodeStatus; blocked: boolean }) {
  const isConversation = node.kind === "conversation";
  const label = isConversation ? "Conversa" : "Lição";
  const Icon = status === "done" ? CheckIcon : status === "locked" ? LockIcon : isConversation ? MicIcon : PencilIcon;
  const styles: Record<NodeStatus, string> = {
    done: "border-ok/30 bg-ok-soft text-ok-dark",
    current: "border-transparent bg-sun-500 text-ink shadow-[0_4px_12px_rgba(255,122,69,0.35)]",
    unlocked: "border-line bg-white text-brand-500 hover:border-brand-200",
    locked: "border-transparent bg-sand text-[#6b6455]",
  };
  const className = `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${styles[status]}`;

  if (status === "locked") {
    return (
      <span className={className} aria-disabled="true">
        <Icon size={15} /> {label}
      </span>
    );
  }
  return (
    <Link href={blocked && status !== "done" ? "/planos" : nodeHref(node)} className={className}>
      <Icon size={15} /> {label}
    </Link>
  );
}

export default function TravelPage() {
  const { progress, loaded } = useProgress();
  const statuses = nodeStatuses(progress);
  const next = currentNode(progress);
  const blocked = lessonsLeftToday(progress) === 0;
  const currentLevelIndex = next ? UNITS.findIndex((u) => u.level === next.unit.level) : UNITS.length;

  // Rola o roteiro até a parada atual ao abrir a página.
  useEffect(() => {
    if (loaded) document.getElementById("current-stop")?.scrollIntoView({ block: "center" });
  }, [loaded]);

  return (
    <div className="px-4 pt-6">
      <header>
        <p className="text-sm font-medium text-muted">
          {greeting()}
          {progress.name ? `, ${progress.name}` : ""}
        </p>
        <h1 className="heading text-3xl">Sua viagem</h1>
      </header>

      {/* próxima parada */}
      <section className="mt-5 flex items-center gap-4 rounded-3xl bg-brand-500 p-5 text-paper">
        <Mascot hat size={84} mood={next ? "happy" : "celebrate"} className="shrink-0" />
        <div className="min-w-0 flex-1">
          {next ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Próxima parada</p>
              <p className="mt-1 font-display text-xl font-bold leading-tight">
                {next.unit.city} · {next.scenario.title}
              </p>
              <p className="mt-0.5 text-sm text-brand-100">{next.kind === "conversation" ? "Conversa por voz" : "Lição rápida"}</p>
              <Link href={blocked ? "/planos" : nodeHref(next)} className="btn btn-primary mt-3 px-5 py-2.5">
                {blocked ? "Lições de hoje acabaram" : "Continuar viagem"}
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">Viagem completa</p>
              <p className="mt-1 font-display text-xl font-bold leading-tight">Você carimbou o passaporte inteiro!</p>
            </>
          )}
        </div>
      </section>

      {progress.plan === "premium" && (
        <Link href={`/conversa/${FREE_TALK.id}`} className="card mt-4 flex items-center gap-4 p-4 hover:bg-sand/50">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-500">
            <ChatIcon size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">Conversa livre</span>
            <span className="block text-sm text-muted">Fale sobre qualquer assunto com o Kiko</span>
          </span>
          <ChevronRightIcon className="text-muted" />
        </Link>
      )}

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="heading text-xl">Roteiro</h2>
        <span className="text-sm font-medium text-muted">
          {Object.keys(progress.completed).length} de {PATH.length} carimbos
        </span>
      </div>

      <div className="mt-4 space-y-4 pb-6">
        {UNITS.map((unit, unitIndex) => {
          const nodes = PATH.filter((n) => n.unit.level === unit.level);
          const done = nodes.filter((n) => statuses.get(n.id) === "done").length;
          const allDone = done === nodes.length;
          const isCurrent = unitIndex === currentLevelIndex;
          const reachable = nodes.some((n) => statuses.get(n.id) !== "locked");
          const cityState = allDone ? "done" : isCurrent ? "current" : reachable ? "open" : "locked";

          return (
            <section key={unit.level} className={`card overflow-hidden ${cityState === "locked" ? "bg-white/60" : ""}`}>
              <div className="flex items-center gap-4 p-4">
                <Stamp code={unit.code} state={cityState} size={52} />
                <div className="min-w-0 flex-1">
                  <p className={`font-display text-lg font-bold ${cityState === "locked" ? "text-[#6b6455]" : "text-brand-500"}`}>
                    {unit.city}
                  </p>
                  <p className="text-sm text-muted">
                    {unit.level} · {LEVEL_INFO[unit.level].name} · {unit.title}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div
                      className={`h-full rounded-full ${allDone ? "bg-ok" : "bg-sun-500"}`}
                      style={{ width: `${(done / nodes.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="self-start text-xs font-semibold text-muted">
                  {done}/{nodes.length}
                </span>
              </div>

              {/* paradas da cidade: só para cidades já liberadas */}
              {cityState !== "locked" ? (
                <ol className="border-t border-line px-4 pb-2 pt-3">
                  {lessonsOf(unit.level).map((scenario, i, list) => {
                    const lesson = PATH.find((n) => n.id === `${scenario.id}:licao`)!;
                    const talk = PATH.find((n) => n.id === `${scenario.id}:conversa`)!;
                    const lessonStatus = statuses.get(lesson.id) ?? "locked";
                    const talkStatus = statuses.get(talk.id) ?? "locked";
                    const stopDone = lessonStatus === "done" && talkStatus === "done";
                    const stopCurrent = lessonStatus === "current" || talkStatus === "current";
                    const stopLocked = lessonStatus === "locked" && talkStatus === "locked";
                    const last = i === list.length - 1;
                    return (
                      <li key={scenario.id} id={stopCurrent ? "current-stop" : undefined} className="flex gap-3">
                        <div className="flex w-8 flex-col items-center">
                          <span
                            className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                              stopDone
                                ? "bg-ok text-white"
                                : stopCurrent
                                  ? "bg-sun-500 text-ink"
                                  : stopLocked
                                    ? "bg-sand text-[#8a8270]"
                                    : "border border-brand-200 bg-white text-brand-500"
                            }`}
                          >
                            {stopDone ? <CheckIcon size={16} /> : i + 1}
                          </span>
                          {!last && <span className={`mt-1 w-0.5 flex-1 ${stopDone ? "route-line" : "route-line-muted"}`} />}
                        </div>
                        <div className="min-w-0 flex-1 pb-4">
                          <p className={`font-semibold ${stopLocked ? "text-[#6b6455]" : ""}`}>{scenario.title}</p>
                          <p className="text-sm text-muted">{scenario.description}</p>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <StepChip node={lesson} status={lessonStatus} blocked={blocked} />
                            <StepChip node={talk} status={talkStatus} blocked={blocked} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="flex items-center gap-2 border-t border-line px-4 py-3 text-sm text-muted">
                  <LockIcon size={15} /> Libera quando você completar {UNITS[unitIndex - 1]?.city ?? "a cidade anterior"}.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
