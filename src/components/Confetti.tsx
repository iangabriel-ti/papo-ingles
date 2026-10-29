"use client";

import { useMemo } from "react";

const COLORS = ["#0f3d5e", "#ff7a45", "#ffc94d", "#2e8b6e", "#2e8bc0", "#f3eadb"];

export function Confetti({ pieces = 90 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        color: COLORS[i % COLORS.length],
        width: 6 + Math.random() * 6,
        height: 8 + Math.random() * 10,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 200,
        round: Math.random() > 0.7,
      })),
    [pieces],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.width,
              height: p.round ? p.width : p.height,
              background: p.color,
              borderRadius: p.round ? "9999px" : "2px",
              "--delay": `${p.delay}s`,
              "--duration": `${p.duration}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
