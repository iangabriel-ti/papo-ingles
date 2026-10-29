"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CompletionScreen, ErrorScreen, LessonTopBar } from "@/components/LessonParts";
import { BulbIcon, CheckIcon, MicIcon, SendIcon, SpeakerIcon, StopIcon, TranslateIcon, TurtleIcon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { LESSON_TURNS, XP_CONVERSATION } from "@/lib/config";
import { explainInPortuguese, type Level } from "@/lib/levels";
import { lessonsLeftToday, loadProgress, useProgress, withActivityCompleted, withLessonStarted } from "@/lib/progress";
import { FREE_TALK, getScenario, unitOf } from "@/lib/scenarios";
import { playSound } from "@/lib/sounds";
import { speak, stopSpeaking, useSpeechRecognition } from "@/lib/speech";
import type { Feedback, TeacherTurn, TranscriptLine } from "@/lib/types";

type ApiMessage = { role: "user" | "assistant"; content: unknown };

type ChatItem =
  | { kind: "teacher"; turn: TeacherTurn }
  | { kind: "student"; text: string; correction?: TeacherTurn["correction"] };

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-500 hover:bg-brand-100";

function TeacherBubble({ turn, level, speaking }: { turn: TeacherTurn; level: Level; speaking: boolean }) {
  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <div className="animate-pop flex items-end gap-2">
      <Mascot size={44} mood={speaking ? "talking" : "happy"} className="shrink-0" />
      <div className="max-w-[85%] rounded-3xl rounded-bl-md border border-line bg-white px-4 py-3">
        <p className="text-[17px] leading-snug">{turn.reply}</p>
        {showTranslation && <p className="mt-2 border-t border-line pt-2 text-sm text-muted">{turn.translation}</p>}
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button onClick={() => speak(turn.reply, level)} className={chipClass}>
            <SpeakerIcon size={14} /> Ouvir
          </button>
          <button onClick={() => speak(turn.reply, "A1")} className={chipClass}>
            <TurtleIcon size={14} /> Devagar
          </button>
          <button onClick={() => setShowTranslation((v) => !v)} className={chipClass}>
            <TranslateIcon size={14} /> {showTranslation ? "Ocultar" : "Traduzir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentBubble({ text, correction, portuguese }: { text: string; correction?: TeacherTurn["correction"]; portuguese: boolean }) {
  return (
    <div className="animate-pop flex flex-col items-end gap-2">
      <div className="max-w-[85%] rounded-3xl rounded-br-md bg-brand-500 px-4 py-3 text-[17px] text-paper">{text}</div>
      {correction &&
        (correction.has_issue ? (
          <div className="max-w-[88%] rounded-2xl border-2 border-dashed border-sun-500 bg-white px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-sun-700">
              {portuguese ? "Ajuste de rota" : "Better way to say it"}
            </p>
            <p className="mt-1 text-base font-semibold text-ink">{correction.corrected}</p>
            <p className="mt-1 text-muted">{correction.explanation}</p>
            <button
              onClick={() => speak(correction.corrected, "B1")}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sun-50 px-3 py-1.5 text-xs font-semibold text-sun-700"
            >
              <SpeakerIcon size={14} /> Ouvir a forma certa
            </button>
          </div>
        ) : (
          <p className="flex items-center gap-1 text-sm font-semibold text-ok-dark">
            <CheckIcon size={16} /> {portuguese ? "Perfeito!" : "Perfect!"}
          </p>
        ))}
    </div>
  );
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const scenario = getScenario(id);
  const { progress, loaded, update } = useProgress();
  const level: Level = id === FREE_TALK.id ? (progress.level ?? "A1") : (scenario?.level ?? "A1");
  const portuguese = explainInPortuguese(level);
  const isFreeTalk = id === FREE_TALK.id;

  const [history, setHistory] = useState<ApiMessage[]>([]);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [stage, setStage] = useState<"chat" | "report" | "done">("chat");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [reportError, setReportError] = useState(false);
  const startedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const speech = useSpeechRecognition();

  const studentTurns = items.filter((i) => i.kind === "student").length;
  const lessonOver = !isFreeTalk && studentTurns >= LESSON_TURNS && !waiting;

  const say = useCallback(
    (text: string) => {
      if (!loadProgress().settings.autoPlayAudio) return;
      setSpeaking(true);
      speak(text, level, () => setSpeaking(false));
    },
    [level],
  );

  const send = useCallback(
    async (userText: string | null) => {
      setWaiting(true);
      setError(null);
      setShowHints(false);
      stopSpeaking();
      if (userText) setItems((prev) => [...prev, { kind: "student", text: userText }]);
      const turnNumber = studentTurns + (userText ? 1 : 0);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: id,
            level,
            history,
            userText,
            isLastTurn: !isFreeTalk && turnNumber >= LESSON_TURNS,
          }),
        });
        const data = await res.json();
        if (res.status === 401) return router.replace(`/entrar?next=${encodeURIComponent(`/conversa/${id}`)}`);
        if (res.status === 402) return router.replace("/planos");
        if (!res.ok) throw new Error(data.error ?? "Erro ao falar com a IA.");
        const turn: TeacherTurn = data.turn;
        setHistory((prev) => [...prev, data.userMessage, data.assistantMessage]);
        setItems((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (userText && last?.kind === "student") next[next.length - 1] = { ...last, correction: turn.correction };
          return [...next, { kind: "teacher", turn }];
        });
        setSuggestions(turn.suggestions);
        if (userText) playSound(turn.correction.has_issue ? "tap" : "correct", loadProgress().settings.sounds);
        say(turn.reply);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erro ao falar com a IA.";
        if (!userText) setFatal(message);
        else {
          setError(message);
          // Devolve o texto para o aluno tentar de novo.
          setItems((prev) => prev.slice(0, -1));
          setInput(userText);
        }
      } finally {
        setWaiting(false);
      }
    },
    [history, id, isFreeTalk, level, router, say, studentTurns],
  );

  // Começa a conversa: o Kiko fala primeiro.
  useEffect(() => {
    if (!loaded || !scenario || startedRef.current) return;
    if (isFreeTalk && progress.plan !== "premium") {
      router.replace("/planos");
      return;
    }
    if (lessonsLeftToday(progress) === 0) {
      router.replace("/planos");
      return;
    }
    startedRef.current = true;
    update(withLessonStarted);
    void send(null);
  }, [loaded, scenario, isFreeTalk, progress, router, update, send]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items, waiting]);

  useEffect(() => () => stopSpeaking(), []);

  const submit = (text: string) => {
    const clean = text.trim();
    if (!clean || waiting || lessonOver) return;
    setInput("");
    void send(clean);
  };

  const finishLesson = async () => {
    stopSpeaking();
    setStage("report");
    const transcript: TranscriptLine[] = items.map((item) =>
      item.kind === "teacher" ? { speaker: "teacher", text: item.turn.reply } : { speaker: "student", text: item.text },
    );
    let report: Feedback | null = null;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: id, level, transcript }),
      });
      const data = await res.json();
      if (res.ok) report = data.feedback;
      else setReportError(true);
    } catch {
      setReportError(true);
    }
    setFeedback(report);
    update((p) =>
      withActivityCompleted(
        p,
        {
          id: crypto.randomUUID(),
          nodeId: `${id}:conversa`,
          scenarioId: id,
          kind: "conversation",
          date: new Date().toISOString(),
          score: report?.score ?? null,
          xp: XP_CONVERSATION,
        },
        report?.vocabulary ?? [],
      ),
    );
    playSound("complete", loadProgress().settings.sounds);
    setStage("done");
  };

  if (!scenario) return <ErrorScreen message="Conversa não encontrada." />;
  if (fatal) return <ErrorScreen message={fatal} onRetry={() => { setFatal(null); void send(null); }} />;

  if (stage === "report") {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <Mascot hat mood="thinking" size={140} className="animate-bob mx-auto" />
          <p className="heading mt-6 text-2xl">Analisando sua conversa…</p>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    const corrections = items.filter((i) => i.kind === "student" && i.correction?.has_issue).length;
    return (
      <CompletionScreen
        title="Carimbo conquistado!"
        stampCode={isFreeTalk ? undefined : unitOf(scenario.level).code}
        subtitle={feedback?.summary ?? (reportError ? "Não consegui gerar o relatório desta vez, mas seu progresso foi salvo." : undefined)}
        tiles={[
          { label: "XP ganho", value: `+${XP_CONVERSATION}`, tone: "sun" },
          { label: "Nota", value: feedback ? String(feedback.score) : "—", tone: "ok" },
          { label: "Ajustes", value: String(corrections), tone: "sky" },
        ]}
        primary={
          <Link href="/aprender" className="btn btn-primary">
            Continuar
          </Link>
        }
      >
        {feedback && (
          <div className="space-y-5">
            <div className="card p-5">
              <p className="heading text-lg">Pontos fortes</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {feedback.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <p className="heading text-lg">Para melhorar</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {feedback.improvements.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <p className="heading text-lg">Palavras novas</p>
              <p className="text-sm text-muted">Já estão salvas em Palavras.</p>
              <ul className="mt-3 space-y-3">
                {feedback.vocabulary.map((v) => (
                  <li key={v.term} className="flex items-start gap-3">
                    <button
                      onClick={() => speak(v.term, "B1")}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500"
                      aria-label={`Ouvir ${v.term}`}
                    >
                      <SpeakerIcon size={16} />
                    </button>
                    <span>
                      <span className="font-semibold">{v.term}</span> <span className="text-muted">· {v.meaning}</span>
                      <span className="block text-sm italic text-muted">“{v.example}”</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CompletionScreen>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <LessonTopBar progress={isFreeTalk ? Math.min(1, studentTurns / 20) : studentTurns / LESSON_TURNS} />
      <div className="mx-auto mt-3 flex w-full max-w-2xl items-center gap-2 px-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-sun-700">
            {isFreeTalk ? "Conversa livre" : `${unitOf(scenario.level).city} · ${level}`}
          </p>
          <p className="heading truncate text-lg">{scenario.title}</p>
        </div>
        <button
          onClick={() => update((p) => ({ ...p, settings: { ...p.settings, autoPlayAudio: !p.settings.autoPlayAudio } }))}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          <SpeakerIcon size={14} /> {progress.settings.autoPlayAudio ? "Voz ligada" : "Voz desligada"}
        </button>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-5 py-6">
        <div className="space-y-5">
          {items.map((item, i) =>
            item.kind === "teacher" ? (
              <TeacherBubble key={i} turn={item.turn} level={level} speaking={speaking && i === items.length - 1} />
            ) : (
              <StudentBubble key={i} text={item.text} correction={item.correction} portuguese={portuguese} />
            ),
          )}
          {waiting && (
            <div className="flex items-end gap-2">
              <Mascot size={44} mood="thinking" />
              <div className="flex gap-1.5 rounded-3xl border border-line bg-white px-4 py-4">
                <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted [animation-delay:0.15s]" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto w-full max-w-2xl px-5 py-4">
          {lessonOver ? (
            <button onClick={finishLesson} className="btn btn-primary w-full py-4 text-base">
              Concluir e ver meu resultado
            </button>
          ) : (
            <>
              {error && <p className="mb-3 text-sm font-medium text-bad">{error}</p>}
              {speech.error && <p className="mb-3 text-sm font-medium text-bad">{speech.error}</p>}
              {showHints && suggestions.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => submit(s)} disabled={waiting} className="tile text-left text-sm">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {speech.listening && (
                <p className="mb-3 text-center text-muted">{speech.interim ? `“${speech.interim}”` : "Pode falar, estou ouvindo…"}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHints((v) => !v)}
                  disabled={waiting || suggestions.length === 0}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-white text-brand-500 disabled:opacity-50"
                  aria-label="Mostrar sugestões de resposta"
                  title="Não sabe o que dizer? Veja sugestões"
                >
                  <BulbIcon size={20} />
                </button>
                <form
                  className="flex min-w-0 flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(input);
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={waiting || speech.listening}
                    placeholder={speech.supported ? "Fale ou digite em inglês…" : "Digite em inglês…"}
                    className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-3 outline-none focus:border-brand-300"
                  />
                  {input.trim() && (
                    <button type="submit" disabled={waiting} aria-label="Enviar" className="btn btn-dark shrink-0 px-4">
                      <SendIcon size={18} />
                    </button>
                  )}
                </form>
                {speech.supported && !input.trim() && (
                  <button
                    onClick={() => (speech.listening ? speech.stop() : speech.start(submit))}
                    disabled={waiting}
                    aria-label={speech.listening ? "Parar de gravar" : "Falar"}
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sun-500 text-ink shadow-[0_6px_16px_rgba(255,122,69,0.35)] transition-transform active:scale-95 hover:bg-sun-600 disabled:opacity-50 ${
                      speech.listening ? "mic-listening" : ""
                    }`}
                  >
                    {speech.listening ? <StopIcon size={22} /> : <MicIcon size={24} />}
                  </button>
                )}
              </div>
              {isFreeTalk && studentTurns >= 2 && (
                <button onClick={finishLesson} disabled={waiting} className="btn btn-ghost mt-3 w-full">
                  Encerrar conversa e ver resultado
                </button>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
