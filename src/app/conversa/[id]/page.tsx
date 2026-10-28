"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CompletionScreen, ErrorScreen, LessonTopBar } from "@/components/LessonParts";
import { Mascot } from "@/components/Mascot";
import { LESSON_TURNS, XP_CONVERSATION } from "@/lib/config";
import { explainInPortuguese, type Level } from "@/lib/levels";
import { lessonsLeftToday, loadProgress, useProgress, withActivityCompleted, withLessonStarted } from "@/lib/progress";
import { FREE_TALK, getScenario } from "@/lib/scenarios";
import { playSound } from "@/lib/sounds";
import { speak, stopSpeaking, useSpeechRecognition } from "@/lib/speech";
import type { Feedback, TeacherTurn, TranscriptLine } from "@/lib/types";

type ApiMessage = { role: "user" | "assistant"; content: unknown };

type ChatItem =
  | { kind: "teacher"; turn: TeacherTurn }
  | { kind: "student"; text: string; correction?: TeacherTurn["correction"] };

function TeacherBubble({ turn, level, speaking }: { turn: TeacherTurn; level: Level; speaking: boolean }) {
  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <div className="animate-pop flex items-end gap-2">
      <Mascot size={44} mood={speaking ? "talking" : "happy"} className="shrink-0" />
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border-2 border-line bg-white px-4 py-3">
        <p className="text-[17px] font-semibold leading-snug">{turn.reply}</p>
        {showTranslation && <p className="mt-2 border-t-2 border-line pt-2 text-sm font-semibold text-muted">{turn.translation}</p>}
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => speak(turn.reply, level)}
            className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-extrabold text-brand-600 hover:bg-brand-100"
          >
            🔊 Ouvir
          </button>
          <button
            onClick={() => speak(turn.reply, "A1")}
            className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-extrabold text-brand-600 hover:bg-brand-100"
          >
            🐢 Devagar
          </button>
          <button
            onClick={() => setShowTranslation((v) => !v)}
            className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-extrabold text-brand-600 hover:bg-brand-100"
          >
            🇧🇷 {showTranslation ? "Ocultar" : "Traduzir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentBubble({ text, correction, portuguese }: { text: string; correction?: TeacherTurn["correction"]; portuguese: boolean }) {
  return (
    <div className="animate-pop flex flex-col items-end gap-2">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500 px-4 py-3 text-[17px] font-semibold text-white">{text}</div>
      {correction &&
        (correction.has_issue ? (
          <div className="max-w-[85%] rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm">
            <p className="font-black uppercase tracking-wide text-amber-600">{portuguese ? "Dica de correção" : "Better way to say it"}</p>
            <p className="mt-1 text-base font-bold text-ink">{correction.corrected}</p>
            <p className="mt-1 font-semibold text-muted">{correction.explanation}</p>
            <button
              onClick={() => speak(correction.corrected, "B1")}
              className="mt-2 rounded-lg bg-white px-2 py-1 text-xs font-extrabold text-amber-600"
            >
              🔊 Ouvir a forma certa
            </button>
          </div>
        ) : (
          <p className="text-sm font-extrabold text-ok-dark">✓ {portuguese ? "Perfeito!" : "Perfect!"}</p>
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
          <Mascot mood="thinking" size={140} className="animate-bob mx-auto" />
          <p className="mt-6 text-xl font-extrabold">Analisando sua conversa…</p>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    const corrections = items.filter((i) => i.kind === "student" && i.correction?.has_issue).length;
    return (
      <CompletionScreen
        title="Conversa concluída!"
        subtitle={feedback?.summary ?? (reportError ? "Não consegui gerar o relatório desta vez, mas seu progresso foi salvo." : undefined)}
        tiles={[
          { label: "XP total", value: `⚡ ${XP_CONVERSATION}`, color: "border-amber-400 bg-amber-400" },
          { label: "Nota", value: feedback ? `⭐ ${feedback.score}` : "—", color: "border-ok bg-ok" },
          { label: "Correções", value: `✏️ ${corrections}`, color: "border-sky-400 bg-sky-400" },
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
              <p className="font-black text-ok-dark">💪 Pontos fortes</p>
              <ul className="mt-2 space-y-1.5 font-semibold">
                {feedback.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <p className="font-black text-amber-600">🎯 Para melhorar</p>
              <ul className="mt-2 space-y-1.5 font-semibold">
                {feedback.improvements.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <p className="font-black text-brand-600">📖 Palavras novas (salvas no seu vocabulário)</p>
              <ul className="mt-3 space-y-3">
                {feedback.vocabulary.map((v) => (
                  <li key={v.term} className="flex items-start gap-3">
                    <button onClick={() => speak(v.term, "B1")} className="mt-0.5 text-lg" aria-label={`Ouvir ${v.term}`}>
                      🔊
                    </button>
                    <span>
                      <span className="font-extrabold">{v.term}</span> <span className="font-semibold text-muted">· {v.meaning}</span>
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
        <span className="text-xl">{scenario.emoji}</span>
        <p className="font-extrabold">{scenario.title}</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-black text-brand-600">{level}</span>
        <button
          onClick={() => update((p) => ({ ...p, settings: { ...p.settings, autoPlayAudio: !p.settings.autoPlayAudio } }))}
          className="ml-auto rounded-lg px-2 py-1 text-xs font-extrabold text-muted hover:bg-black/5"
        >
          {progress.settings.autoPlayAudio ? "🔊 Voz ligada" : "🔇 Voz desligada"}
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
              <div className="flex gap-1.5 rounded-2xl border-2 border-line bg-white px-4 py-4">
                <span className="typing-dot h-2 w-2 rounded-full bg-muted" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted [animation-delay:0.15s]" />
                <span className="typing-dot h-2 w-2 rounded-full bg-muted [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="border-t-2 border-line bg-white">
        <div className="mx-auto w-full max-w-2xl px-5 py-4">
          {lessonOver ? (
            <button onClick={finishLesson} className="btn btn-ok w-full py-4 text-base">
              Concluir e ver meu resultado
            </button>
          ) : (
            <>
              {error && <p className="mb-3 text-sm font-bold text-bad">{error}</p>}
              {speech.error && <p className="mb-3 text-sm font-bold text-bad">{speech.error}</p>}
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
                <p className="mb-3 text-center font-semibold text-muted">{speech.interim ? `“${speech.interim}”` : "Pode falar, estou ouvindo…"}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHints((v) => !v)}
                  disabled={waiting || suggestions.length === 0}
                  className="btn btn-white shrink-0 px-3"
                  aria-label="Mostrar sugestões de resposta"
                  title="Não sabe o que dizer? Veja sugestões"
                >
                  💡
                </button>
                <form
                  className="flex flex-1 items-center gap-2"
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
                    className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-[#f7f7fa] px-4 py-3 font-semibold outline-none focus:border-brand-300"
                  />
                  {input.trim() && (
                    <button type="submit" disabled={waiting} className="btn btn-primary shrink-0 px-4">
                      ➤
                    </button>
                  )}
                </form>
                {speech.supported && !input.trim() && (
                  <button
                    onClick={() => (speech.listening ? speech.stop() : speech.start(submit))}
                    disabled={waiting}
                    aria-label={speech.listening ? "Parar de gravar" : "Falar"}
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-b-4 text-2xl text-white transition-transform active:translate-y-[2px] ${
                      speech.listening ? "mic-listening border-brand-700 bg-brand-500" : "border-brand-700 bg-brand-500 hover:brightness-110"
                    } disabled:opacity-50`}
                  >
                    {speech.listening ? "■" : "🎤"}
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
