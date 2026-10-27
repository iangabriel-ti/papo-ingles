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

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);

  useEffect(() => {
    setSupported(getRecognitionConstructor() !== null);
    return () => recognitionRef.current?.abort();
  }, []);

  const start = useCallback((onFinal: (text: string) => void) => {
    const Ctor = getRecognitionConstructor();
    if (!Ctor) return;
    window.speechSynthesis?.cancel();
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    let finalText = "";
    recognition.onresult = (event) => {
      let partial = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else partial += result[0].transcript;
      }
      setInterim(finalText + partial);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Permita o uso do microfone no navegador para falar com a professora.");
      } else if (event.error === "no-speech") {
        setError("Não ouvi nada. Toque no microfone e tente de novo.");
      } else if (event.error !== "aborted") {
        setError("O microfone falhou. Você pode digitar sua resposta.");
      }
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
      if (finalText.trim()) onFinal(finalText.trim());
    };

    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  }, []);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { supported, listening, interim, error, start, stop };
}

const RATE_BY_LEVEL: Record<Level, number> = { A1: 0.8, A2: 0.88, B1: 0.95, B2: 1, C1: 1.05 };

function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  // Prefere vozes femininas de melhor qualidade quando o sistema oferece.
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
