"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CompletionScreen, ErrorScreen, LessonTopBar, LoadingLesson } from "@/components/LessonParts";
import { MascotSays } from "@/components/Mascot";
import { XP_EXERCISE_LESSON, XP_PERFECT_BONUS } from "@/lib/config";
import { findNode } from "@/lib/path";
import { lessonsLeftToday, loadProgress, useProgress, withActivityCompleted, withLessonStarted } from "@/lib/progress";
import { getScenario } from "@/lib/scenarios";
import { playSound } from "@/lib/sounds";
import { speak, useSpeechRecognition } from "@/lib/speech";
import { normalizeSentence, type Exercise } from "@/lib/types";

type Result = { correct: boolean; answerLabel: string; heard?: string };

const TITLES: Record<Exercise["type"], string> = {
  translate: "O que significa esta frase?",
  build_sentence: "Escreva em inglês",
  fill_blank: "Complete a frase",
  listen: "Toque no que você ouvir",
  speak: "Fale esta frase",
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function wordsOf(sentence: string) {
  return normalizeSentence(sentence).split(" ").filter(Boolean);
}

// Quanto da frase-alvo apareceu no que o aluno falou (0 a 1).
function speechMatch(target: string, heard: string) {
  const expected = wordsOf(target);
  const said = wordsOf(heard);
  let hits = 0;
  for (const word of expected) {
    const i = said.indexOf(word);
    if (i >= 0) {
      hits++;
      said.splice(i, 1);
    }
  }
  return expected.length ? hits / expected.length : 0;
}

function SpeakerButton({ text, size = "lg", slow = false }: { text: string; size?: "lg" | "sm"; slow?: boolean }) {
  return (
    <button
      onClick={() => speak(text, slow ? "A1" : "B1")}
      aria-label={slow ? "Ouvir devagar" : "Ouvir"}
      className={`grid shrink-0 place-items-center rounded-2xl border-b-4 border-brand-700 bg-brand-500 text-white active:translate-y-[2px] active:border-b-2 ${
        size === "lg" ? "h-24 w-24 text-4xl" : "h-12 w-12 text-xl"
      }`}
    >
      {slow ? "🐢" : "🔊"}
    </button>
  );
}

function Options({
  options,
  selected,
  onSelect,
  disabled,
}: {
  options: string[];
  selected: number | null;
  onSelect: (i: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelect(i)}
          className={`option flex items-center gap-3 ${selected === i ? "option-selected" : ""}`}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-line text-xs font-black text-muted">
            {i + 1}
          </span>
          {option}
        </button>
      ))}
    </div>
  );
}

function ExerciseView({
  exercise,
  locked,
  onAnswerChange,
  onSpoken,
  onSkipSpeaking,
}: {
  exercise: Exercise;
  locked: boolean;
  onAnswerChange: (answer: number | string[] | null) => void;
  onSpoken: (heard: string) => void;
  onSkipSpeaking: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const speech = useSpeechRecognition();

  const bank = useMemo(
    () =>
      exercise.type === "build_sentence"
        ? shuffle([...exercise.sentence_en.replace(/[.!?]+$/, "").split(" "), ...exercise.extra_words])
        : [],
    [exercise],
  );

  // Toca o áudio automaticamente nos exercícios de ouvir e traduzir.
  useEffect(() => {
    if (exercise.type === "listen" || exercise.type === "translate") {
      const t = setTimeout(() => speak(exercise.sentence_en, "B1"), 350);
      return () => clearTimeout(t);
    }
  }, [exercise]);

  const choose = (i: number) => {
    playSound("tap");
    setSelected(i);
    onAnswerChange(i);
  };

  const togglePick = (index: number) => {
    if (locked) return;
    playSound("tap");
    const next = picked.includes(index) ? picked.filter((p) => p !== index) : [...picked, index];
    setPicked(next);
    onAnswerChange(next.length ? next.map((p) => bank[p]) : null);
  };

  switch (exercise.type) {
    case "translate":
      return (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <SpeakerButton text={exercise.sentence_en} size="sm" />
            <p className="text-xl font-bold underline decoration-dotted decoration-line underline-offset-8">{exercise.sentence_en}</p>
          </div>
          <Options options={exercise.options} selected={selected} onSelect={choose} disabled={locked} />
        </div>
      );

    case "fill_blank": {
      const [before, after] = exercise.prompt.split("___");
      const filled = selected !== null ? exercise.options[selected] : null;
      return (
        <div className="space-y-8">
          <p className="text-2xl font-bold leading-relaxed">
            {before}
            <span className={`mx-1 inline-block min-w-20 border-b-4 px-1 text-center ${filled ? "border-brand-300 text-brand-600" : "border-line"}`}>
              {filled ?? " "}
            </span>
            {after}
          </p>
          <div className="flex flex-wrap gap-3">
            {exercise.options.map((option, i) => (
              <button
                key={i}
                disabled={locked}
                onClick={() => choose(i)}
                className={`tile text-lg ${selected === i ? "option-selected" : ""}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    case "listen":
      return (
        <div className="space-y-8">
          <div className="flex items-end justify-center gap-4">
            <SpeakerButton text={exercise.sentence_en} />
            <SpeakerButton text={exercise.sentence_en} size="sm" slow />
          </div>
          <Options options={exercise.options} selected={selected} onSelect={choose} disabled={locked} />
        </div>
      );

    case "build_sentence":
      return (
        <div className="space-y-6">
          <MascotSays size={86}>{exercise.translation_pt}</MascotSays>
          <div className="flex min-h-[116px] flex-wrap content-start gap-2 border-y-2 border-line py-3">
            {picked.map((p) => (
              <button key={p} onClick={() => togglePick(p)} className="tile animate-pop">
                {bank[p]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {bank.map((word, i) => (
              <button
                key={i}
                onClick={() => togglePick(i)}
                disabled={locked || picked.includes(i)}
                className={`tile ${picked.includes(i) ? "border-line bg-line text-transparent" : ""}`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      );

    case "speak":
      return (
        <div className="space-y-10">
          <MascotSays size={86}>
            <span className="flex items-center gap-3">
              <SpeakerButton text={exercise.sentence_en} size="sm" />
              <span>
                <span className="block text-lg">{exercise.sentence_en}</span>
                <span className="block text-sm font-semibold text-muted">{exercise.translation_pt}</span>
              </span>
            </span>
          </MascotSays>
          {speech.supported ? (
            <div className="text-center">
              <button
                disabled={locked}
                onClick={() => (speech.listening ? speech.stop() : speech.start(onSpoken))}
                className={`btn w-full max-w-sm py-5 text-base ${speech.listening ? "btn-primary mic-listening" : "btn-white"}`}
              >
                🎤 {speech.listening ? "Ouvindo… toque para parar" : "Toque para falar"}
              </button>
              {speech.interim && <p className="mt-4 font-semibold text-muted">“{speech.interim}”</p>}
              {speech.error && <p className="mt-4 text-sm font-semibold text-bad">{speech.error}</p>}
            </div>
          ) : (
            <p className="text-center font-semibold text-muted">
              Seu navegador não reconhece voz. Use o Chrome, o Edge ou o Safari para praticar a fala.
            </p>
          )}
          {!locked && (
            <div className="text-center">
              <button onClick={onSkipSpeaking} className="btn btn-ghost">
                Não posso falar agora
              </button>
            </div>
          )}
        </div>
      );
  }
}

function correctLabel(exercise: Exercise) {
  if (exercise.type === "translate") return exercise.options[exercise.correct_option];
  return exercise.sentence_en;
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const scenario = getScenario(id);
  const node = findNode(`${id}:licao`);
  const { progress, update } = useProgress();

  const [queue, setQueue] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [position, setPosition] = useState(0);
  const [answer, setAnswer] = useState<number | string[] | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    if (lessonsLeftToday(loadProgress()) === 0) {
      router.replace("/planos");
      return;
    }
    loadingRef.current = true;
    setError(null);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: id }),
      });
      const data = await res.json();
      if (res.status === 401) return router.replace(`/entrar?next=${encodeURIComponent(`/licao/${id}`)}`);
      if (res.status === 402) return router.replace("/planos");
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar a lição.");
      setQueue(data.exercises);
      setTotal(data.exercises.length);
      startedAt.current = Date.now();
      update(withLessonStarted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar a lição.");
    } finally {
      loadingRef.current = false;
    }
  }, [id, router, update]);

  useEffect(() => {
    if (scenario) void load();
  }, [scenario, load]);

  const exercise = queue[position];

  const check = useCallback(
    (heard?: string) => {
      if (!exercise || result) return;
      let correct = false;
      if (exercise.type === "build_sentence") {
        correct = Array.isArray(answer) && normalizeSentence(answer.join(" ")) === normalizeSentence(exercise.sentence_en);
      } else if (exercise.type === "speak") {
        correct = speechMatch(exercise.sentence_en, heard ?? "") >= 0.7;
      } else {
        correct = answer === exercise.correct_option;
      }
      playSound(correct ? "correct" : "wrong", progress.settings.sounds);
      if (!correct) {
        setMistakes((m) => m + 1);
        // Como no Duolingo: o que o aluno errou volta no fim da lição.
        if (exercise.type !== "speak") setQueue((q) => [...q, exercise]);
      }
      setResult({ correct, answerLabel: correctLabel(exercise), heard });
    },
    [answer, exercise, result, progress.settings.sounds],
  );

  const finish = useCallback(() => {
    setFinished(true);
    playSound("complete", progress.settings.sounds);
    update((p) =>
      withActivityCompleted(p, {
        id: crypto.randomUUID(),
        nodeId: `${id}:licao`,
        scenarioId: id,
        kind: "exercises",
        date: new Date().toISOString(),
        score: Math.round((total / (total + mistakes)) * 100),
        xp: XP_EXERCISE_LESSON + (mistakes === 0 ? XP_PERFECT_BONUS : 0),
      }),
    );
  }, [id, total, mistakes, update, progress.settings.sounds]);

  const next = useCallback(() => {
    setResult(null);
    setAnswer(null);
    if (position + 1 >= queue.length) finish();
    else setPosition((p) => p + 1);
  }, [position, queue.length, finish]);

  // Pular a fala tira o exercício da lição sem contar como erro.
  const skipSpeaking = useCallback(() => {
    setResult(null);
    setAnswer(null);
    const remaining = queue.filter((_, i) => i !== position);
    setQueue(remaining);
    setTotal((t) => t - 1);
    if (position >= remaining.length) finish();
  }, [queue, position, finish]);

  // Atalho: Enter verifica / continua.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || finished) return;
      if (result) next();
      else if (answer !== null && exercise?.type !== "speak") check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, result, finished, exercise, check, next]);

  if (!scenario || !node) return <ErrorScreen message="Lição não encontrada." />;
  if (error) return <ErrorScreen message={error} onRetry={load} />;
  if (!queue.length) return <LoadingLesson message={`Preparando sua lição: ${scenario.title}`} />;

  if (finished) {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    const accuracy = Math.round((total / (total + mistakes)) * 100);
    const xp = XP_EXERCISE_LESSON + (mistakes === 0 ? XP_PERFECT_BONUS : 0);
    return (
      <CompletionScreen
        title={mistakes === 0 ? "Lição perfeita!" : "Lição concluída!"}
        subtitle={`Agora use o que aprendeu numa conversa de verdade: ${scenario.title}.`}
        tiles={[
          { label: "XP total", value: `⚡ ${xp}`, color: "border-amber-400 bg-amber-400" },
          { label: "Precisão", value: `🎯 ${accuracy}%`, color: "border-ok bg-ok" },
          {
            label: "Tempo",
            value: `⏱ ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
            color: "border-sky-400 bg-sky-400",
          },
        ]}
        primary={
          <>
            <Link href={`/conversa/${id}`} className="btn btn-primary">
              🎙️ Praticar na conversa
            </Link>
            <Link href="/aprender" className="btn btn-white">
              Voltar para a trilha
            </Link>
          </>
        }
      />
    );
  }

  const progressValue = (position + (result ? 1 : 0)) / queue.length;
  const canCheck = answer !== null && (!Array.isArray(answer) || answer.length > 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <LessonTopBar progress={progressValue} />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-48 pt-8">
        {position >= total && (
          <p className="mb-2 text-sm font-black uppercase tracking-wide text-orange-500">↻ Erro anterior</p>
        )}
        <h1 className="mb-8 text-2xl font-black">{TITLES[exercise.type]}</h1>
        <ExerciseView
          key={position}
          exercise={exercise}
          locked={result !== null}
          onAnswerChange={setAnswer}
          onSpoken={(heard) => check(heard)}
          onSkipSpeaking={skipSpeaking}
        />
      </main>

      {/* rodapé: verificar / resultado */}
      <footer
        className={`fixed inset-x-0 bottom-0 border-t-2 ${
          result ? (result.correct ? "animate-slide-up border-transparent bg-[#d7ffb8]" : "animate-slide-up border-transparent bg-[#ffdfe0]") : "border-line bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          {result ? (
            <div className={result.correct ? "text-ok-dark" : "text-bad-dark"}>
              <p className="flex items-center gap-2 text-xl font-black">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-base">{result.correct ? "✓" : "✕"}</span>
                {result.correct ? ["Muito bem!", "Excelente!", "Mandou bem!", "Perfeito!"][position % 4] : "Resposta correta:"}
              </p>
              {!result.correct && <p className="mt-1 font-bold">{result.answerLabel}</p>}
              {result.heard && <p className="mt-1 text-sm font-semibold opacity-80">Você disse: “{result.heard}”</p>}
              {exercise.tip && <p className="mt-1 text-sm font-semibold opacity-80">💡 {exercise.tip}</p>}
            </div>
          ) : (
            <span className="hidden sm:block" />
          )}
          {result ? (
            <button onClick={next} className={`btn ${result.correct ? "btn-ok" : "btn-bad"} sm:min-w-40`}>
              Continuar
            </button>
          ) : exercise.type === "speak" ? null : (
            <button onClick={() => check()} disabled={!canCheck} className="btn btn-ok sm:min-w-40">
              Verificar
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
