"use client";

import Link from "next/link";
import { useState } from "react";
import { MascotSays } from "@/components/Mascot";
import { useProgress } from "@/lib/progress";
import { playSound } from "@/lib/sounds";
import { speak } from "@/lib/speech";

function Flashcards({ onClose }: { onClose: () => void }) {
  const { progress } = useProgress();
  const [deck] = useState(() => [...progress.vocabulary].sort(() => Math.random() - 0.5).slice(0, 10));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);

  if (index >= deck.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-3 text-xl font-black">Revisão concluída!</p>
        <p className="mt-1 font-semibold text-muted">
          Você lembrou de {known} de {deck.length} palavras.
        </p>
        <button onClick={onClose} className="btn btn-primary mt-6">
          Voltar
        </button>
      </div>
    );
  }

  const card = deck[index];
  const answer = (gotIt: boolean) => {
    playSound(gotIt ? "correct" : "tap", progress.settings.sounds);
    if (gotIt) setKnown((k) => k + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <div>
      <p className="mb-3 text-sm font-black uppercase text-muted">
        Cartão {index + 1} de {deck.length}
      </p>
      <button
        onClick={() => {
          setRevealed(true);
          speak(card.term, "B1");
        }}
        className="card grid min-h-56 w-full place-items-center border-b-4 p-6 text-center"
      >
        <span>
          <span className="block text-3xl font-black">{card.term}</span>
          {revealed ? (
            <span className="animate-pop mt-4 block">
              <span className="block text-lg font-bold text-brand-600">{card.meaning}</span>
              <span className="mt-2 block italic text-muted">“{card.example}”</span>
            </span>
          ) : (
            <span className="mt-4 block text-sm font-bold text-muted">Toque para ver o significado</span>
          )}
        </span>
      </button>
      {revealed && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => answer(false)} className="btn btn-white">
            Ainda não sei
          </button>
          <button onClick={() => answer(true)} className="btn btn-ok">
            Eu sabia!
          </button>
        </div>
      )}
    </div>
  );
}

export default function VocabularyPage() {
  const { progress } = useProgress();
  const [query, setQuery] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const words = progress.vocabulary.filter(
    (v) => v.term.toLowerCase().includes(query.toLowerCase()) || v.meaning.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-black">Vocabulário</h1>
      <p className="mt-1 font-semibold text-muted">Palavras e expressões que você aprendeu nas conversas.</p>

      {progress.vocabulary.length === 0 ? (
        <div className="mt-10">
          <MascotSays mood="happy">Termine uma conversa e eu guardo aqui as palavras novas para você revisar!</MascotSays>
          <Link href="/aprender" className="btn btn-primary mt-8 w-full">
            Ir para a trilha
          </Link>
        </div>
      ) : reviewing ? (
        <div className="mt-6">
          <Flashcards onClose={() => setReviewing(false)} />
        </div>
      ) : (
        <>
          <button onClick={() => setReviewing(true)} className="btn btn-primary mt-6 w-full">
            🃏 Revisar com cartões
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar palavra…"
            className="mt-6 w-full rounded-2xl border-2 border-line bg-[#f7f7fa] px-4 py-3 font-semibold outline-none focus:border-brand-300"
          />
          <p className="mt-4 text-sm font-black uppercase text-muted">{progress.vocabulary.length} palavras</p>
          <ul className="card mt-2 divide-y-2 divide-line">
            {words.map((v) => (
              <li key={v.term} className="flex items-start gap-3 p-4">
                <button onClick={() => speak(v.term, "B1")} className="text-xl" aria-label={`Ouvir ${v.term}`}>
                  🔊
                </button>
                <span>
                  <span className="font-extrabold">{v.term}</span>
                  <span className="font-semibold text-muted"> · {v.meaning}</span>
                  <span className="block text-sm italic text-muted">“{v.example}”</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
