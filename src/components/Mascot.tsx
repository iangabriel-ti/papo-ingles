// Kiko, a arara mascote do app. Desenhado em SVG para ficar nítido em qualquer tamanho.

export type MascotMood = "happy" | "talking" | "celebrate" | "thinking" | "sad";

export function Mascot({
  mood = "happy",
  size = 120,
  className = "",
  hat = false,
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
  hat?: boolean;
}) {
  const closedEyes = mood === "celebrate";
  const pupilY = mood === "thinking" ? -3 : mood === "sad" ? 2 : 0;
  const pupilX = mood === "thinking" ? 3 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Kiko, a arara"
    >
      {/* rabo */}
      <path d="M62 92 L84 119 L94 114 L72 88 Z" fill="#ffc94d" />
      <path d="M56 94 L70 120 L80 117 L66 90 Z" fill="#ff7a45" />
      {/* asas */}
      <path
        d="M30 62 Q14 78 22 102 Q30 98 38 90 Z"
        fill="#1f6e9e"
        transform={mood === "celebrate" ? "rotate(45 32 66)" : undefined}
      />
      <path
        d="M90 62 Q106 78 98 102 Q90 98 82 90 Z"
        fill="#1f6e9e"
        transform={mood === "celebrate" ? "rotate(-45 88 66)" : undefined}
      />
      <path d="M24 96 Q28 92 34 92" stroke="#ffc94d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M96 96 Q92 92 86 92" stroke="#ffc94d" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* corpo e cabeça */}
      <ellipse cx="60" cy="76" rx="30" ry="28" fill="#2e8bc0" />
      <ellipse cx="60" cy="84" rx="19" ry="18" fill="#ffc94d" />
      <circle cx="60" cy="42" r="30" fill="#2e8bc0" />
      {/* topete */}
      <path d="M56 14 Q60 2 72 6 Q64 8 63 15 Z" fill="#5fb0dc" />
      <path d="M50 16 Q50 6 60 4 Q54 10 56 16 Z" fill="#5fb0dc" />
      {/* pés */}
      <path d="M50 102 q-3 6 -7 7 M50 102 q2 6 0 8" stroke="#5b6b78" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M70 102 q3 6 7 7 M70 102 q-2 6 0 8" stroke="#5b6b78" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* máscara branca do rosto, típica das araras */}
      <ellipse cx="45" cy="43" rx="14" ry="15" fill="#fff" />
      <ellipse cx="75" cy="43" rx="14" ry="15" fill="#fff" />
      <path d="M36 50 q4 2 8 0 M38 55 q4 2 8 0" stroke="#b5d0e2" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M84 50 q-4 2 -8 0 M82 55 q-4 2 -8 0" stroke="#b5d0e2" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* olhos */}
      {closedEyes ? (
        <>
          <path d="M38 41 Q45 33 52 41" stroke="#10263a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M68 41 Q75 33 82 41" stroke="#10263a" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={46 + pupilX} cy={40 + pupilY} r="6.5" fill="#10263a" />
          <circle cx={74 + pupilX} cy={40 + pupilY} r="6.5" fill="#10263a" />
          <circle cx={48 + pupilX} cy={37.5 + pupilY} r="2.2" fill="#fff" />
          <circle cx={76 + pupilX} cy={37.5 + pupilY} r="2.2" fill="#fff" />
          {mood === "sad" && (
            <>
              <path d="M36 26 L54 30" stroke="#10263a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M84 26 L66 30" stroke="#10263a" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}
        </>
      )}
      {/* bico curvo de papagaio */}
      <path
        d="M55 62 Q60 70 65 62 Q64 72 60 74 Q56 72 55 62 Z"
        fill="#10263a"
        className={mood === "talking" ? "beak-talk" : ""}
      />
      <path d="M50 50 Q60 42 70 50 Q73 60 64 68 Q61 70 60 66 Q60 62 56 60 Q50 57 50 50 Z" fill="#1c3348" />
      <path d="M54 50 Q60 46 66 50" stroke="#5b6b78" strokeWidth="2" fill="none" strokeLinecap="round" />
      {hat && (
        <>
          {/* chapéu de viajante */}
          <path d="M24 22 Q60 4 96 22 L88 30 Q60 18 32 30 Z" fill="#ff7a45" />
          <rect x="40" y="6" width="40" height="16" rx="7" fill="#ff7a45" />
          <rect x="40" y="17" width="40" height="4" fill="#b4461f" />
        </>
      )}
    </svg>
  );
}

// Balão de fala ao lado do mascote.
export function MascotSays({
  children,
  mood = "talking",
  size = 96,
}: {
  children: React.ReactNode;
  mood?: MascotMood;
  size?: number;
}) {
  return (
    <div className="flex items-end gap-3">
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className="relative mb-6 rounded-2xl border border-line bg-white px-4 py-3 font-medium">
        <span className="absolute -left-[8px] bottom-4 h-4 w-4 rotate-45 border-b border-l border-line bg-white" />
        {children}
      </div>
    </div>
  );
}
