// Níveis do Quadro Europeu Comum de Referência (CEFR).

export const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_INFO: Record<Level, { name: string; description: string; teacherStyle: string }> = {
  A1: {
    name: "Iniciante",
    description: "Frases bem simples: se apresentar, pedir algo, números, cores.",
    teacherStyle:
      "The student is a complete beginner (CEFR A1). Use very short sentences (max 8 words), only the most common words, present simple. Speak slowly and clearly. Ask one simple question at a time.",
  },
  A2: {
    name: "Básico",
    description: "Situações do dia a dia: compras, rotina, direções, passado simples.",
    teacherStyle:
      "The student is elementary (CEFR A2). Use short, simple sentences, common everyday vocabulary, present and past simple. Ask one question at a time.",
  },
  B1: {
    name: "Intermediário",
    description: "Conversa sobre experiências, planos e opiniões com alguma fluência.",
    teacherStyle:
      "The student is intermediate (CEFR B1). Use natural but clear sentences, everyday phrasal verbs, and a mix of tenses. Encourage longer answers.",
  },
  B2: {
    name: "Intermediário avançado",
    description: "Discussões mais longas, argumentação, inglês de trabalho.",
    teacherStyle:
      "The student is upper-intermediate (CEFR B2). Speak naturally at normal pace, use idioms occasionally, and push for detailed opinions and justifications.",
  },
  C1: {
    name: "Avançado",
    description: "Fluência em temas complexos, nuances e expressões idiomáticas.",
    teacherStyle:
      "The student is advanced (CEFR C1). Speak like a native speaker, use idioms, nuance and sophisticated vocabulary, and challenge the student with complex follow-up questions.",
  },
};

export function isLevel(value: unknown): value is Level {
  return typeof value === "string" && (LEVELS as readonly string[]).includes(value);
}

// Iniciantes recebem as explicações em português; os demais, em inglês.
export function explainInPortuguese(level: Level) {
  return level === "A1" || level === "A2" || level === "B1";
}
