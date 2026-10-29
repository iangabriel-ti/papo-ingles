"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Level } from "./levels";

// Reconhecimento e síntese de voz do próprio navegador (gratuitos).
// Funciona no Chrome, Edge e Safari. No Firefox o aluno usa o teclado.

type RecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Quem está aprendendo fala devagar e faz pausas entre as palavras. Por isso a
// gravação só termina quando o aluno toca em "Terminei" ou depois de um silêncio
// longo; pausas curtas não cortam a frase.
const SILENCE_MS = 2500; // silêncio depois de falar algo
const NO_SPEECH_MS = 8000; // tempo para começar a falar
const MAX_MS = 45000; // limite de uma gravação

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  const activeRef = useRef(false); // o aluno ainda está gravando
  const finishingRef = useRef(false); // pedimos para encerrar e entregar o texto
  const finalsRef = useRef(""); // trechos já confirmados pelo navegador
  const interimRef = useRef(""); // trecho ainda em reconhecimento
  const heardSomethingRef = useRef(false);
  const onDoneRef = useRef<((text: string) => void) | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimers = () => {
    clearTimeout(silenceTimer.current);
    clearTimeout(maxTimer.current);
  };

  const deliver = useCallback(() => {
    clearTimers();
    activeRef.current = false;
    finishingRef.current = false;
    const text = `${finalsRef.current} ${interimRef.current}`.replace(/\s+/g, " ").trim();
    setListening(false);
    setTranscript(text);
    if (!text) setError("Não ouvi nada. Toque no microfone e tente de novo.");
    onDoneRef.current?.(text);
  }, []);

  // Encerra a gravação; o texto é entregue quando o navegador terminar de processar.
  const stop = useCallback(() => {
    if (!activeRef.current) return;
    finishingRef.current = true;
    clearTimers();
    try {
      recognitionRef.current?.stop();
    } catch {
      deliver();
    }
  }, [deliver]);

  const armSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(stop, heardSomethingRef.current ? SILENCE_MS : NO_SPEECH_MS);
  }, [stop]);

  // Cada trecho de reconhecimento termina sozinho numa pausa; enquanto o aluno não
  // terminou, abrimos um novo trecho e vamos juntando o texto.
  const listenSegment = useCallback(() => {
    const Ctor = getRecognitionConstructor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let segmentFinal = "";
    recognition.onresult = (event) => {
      let partial = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) segmentFinal += ` ${result[0].transcript}`;
        else partial += result[0].transcript;
      }
      interimRef.current = `${segmentFinal} ${partial}`.trim();
      if (interimRef.current) heardSomethingRef.current = true;
      setTranscript(`${finalsRef.current} ${interimRef.current}`.replace(/\s+/g, " ").trim());
      armSilenceTimer();
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        activeRef.current = false;
        finishingRef.current = false;
        clearTimers();
        setListening(false);
        setError("Permita o uso do microfone no navegador para falar com o Kiko.");
      } else if (event.error === "network") {
        activeRef.current = false;
        finishingRef.current = false;
        clearTimers();
        setListening(false);
        setError("O reconhecimento de voz precisa de internet. Confira a conexão ou digite sua resposta.");
      }
      // "no-speech" e "aborted" são normais entre as pausas: o próximo trecho continua.
    };
    recognition.onend = () => {
      finalsRef.current = `${finalsRef.current} ${interimRef.current}`.trim();
      interimRef.current = "";
      if (finishingRef.current) deliver();
      else if (activeRef.current) {
        try {
          listenSegment();
        } catch {
          deliver();
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [armSilenceTimer, deliver]);

  const start = useCallback(
    (onDone: (text: string) => void) => {
      if (!getRecognitionConstructor()) return;
      window.speechSynthesis?.cancel();
      onDoneRef.current = onDone;
      finalsRef.current = "";
      interimRef.current = "";
      heardSomethingRef.current = false;
      activeRef.current = true;
      finishingRef.current = false;
      setTranscript("");
      setError(null);
      setListening(true);
      armSilenceTimer();
      maxTimer.current = setTimeout(stop, MAX_MS);
      listenSegment();
    },
    [armSilenceTimer, listenSegment, stop],
  );

  // Descarta a gravação sem entregar o texto (ex.: ao sair da tela).
  const cancel = useCallback(() => {
    activeRef.current = false;
    finishingRef.current = false;
    clearTimers();
    recognitionRef.current?.abort();
    setListening(false);
    setTranscript("");
  }, []);

  useEffect(() => {
    setSupported(getRecognitionConstructor() !== null);
    return () => {
      activeRef.current = false;
      clearTimeout(silenceTimer.current);
      clearTimeout(maxTimer.current);
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, listening, transcript, error, start, stop, cancel };
}

const RATE_BY_LEVEL: Record<Level, number> = { A1: 0.8, A2: 0.88, B1: 0.95, B2: 1, C1: 1.05 };

function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  // Prefere vozes de melhor qualidade quando o sistema oferece.
  const preferred = ["Samantha", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Karen", "Moira"];
  for (const name of preferred) {
    const voice = voices.find((v) => v.name.includes(name));
    if (voice) return voice;
  }
  return voices.find((v) => v.lang === "en-US") ?? voices[0] ?? null;
}

export function speak(text: string, level: Level, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = RATE_BY_LEVEL[level];
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

// Compara o que o aluno falou com a frase esperada, palavra por palavra.
export function compareSpeech(target: string, heard: string, normalize: (s: string) => string) {
  const said = normalize(heard).split(" ").filter(Boolean);
  const words = target.split(/\s+/).filter(Boolean).map((word) => {
    const key = normalize(word);
    const i = key ? said.indexOf(key) : -1;
    if (i >= 0) said.splice(i, 1);
    return { word, ok: !key || i >= 0 };
  });
  const scored = words.filter((w) => normalize(w.word));
  const score = scored.length ? scored.filter((w) => w.ok).length / scored.length : 0;
  return { words, score };
}
