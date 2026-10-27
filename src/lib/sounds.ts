"use client";

// Efeitos sonoros sintetizados na hora (não precisa de arquivos de áudio).

let context: AudioContext | null = null;

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.18) {
  if (!context) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = context.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(context.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playSound(kind: "correct" | "wrong" | "complete" | "tap", enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    switch (kind) {
      case "correct":
        tone(784, 0, 0.12, "triangle");
        tone(1175, 0.09, 0.22, "triangle");
        break;
      case "wrong":
        tone(220, 0, 0.18, "square", 0.08);
        tone(180, 0.12, 0.25, "square", 0.08);
        break;
      case "complete":
        [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle"));
        break;
      case "tap":
        tone(600, 0, 0.05, "sine", 0.08);
        break;
    }
  } catch {
    // Sem áudio disponível: segue em silêncio.
  }
}
