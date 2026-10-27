// Configurações gerais do produto. Mude aqui o nome, os limites e os preços.

export const APP_NAME = "Papo";
export const APP_TAGLINE = "Aprenda inglês conversando de verdade, do básico ao avançado.";
export const MASCOT_NAME = "Kiko";

// Quantas respostas do aluno completam uma lição.
export const LESSON_TURNS = 6;

// Quantas lições (exercícios ou conversa) por dia o plano grátis permite.
export const FREE_DAILY_LESSONS = 4;

// XP ganho em cada atividade.
export const XP_EXERCISE_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_CONVERSATION = 20;

export const DAILY_GOALS = [
  { xp: 20, label: "Casual", minutes: 5 },
  { xp: 40, label: "Regular", minutes: 10 },
  { xp: 60, label: "Sério", minutes: 15 },
  { xp: 100, label: "Intenso", minutes: 20 },
] as const;

export const MOTIVATIONS = [
  { id: "viagem", emoji: "✈️", label: "Viajar" },
  { id: "trabalho", emoji: "💼", label: "Trabalho e carreira" },
  { id: "estudos", emoji: "🎓", label: "Estudos e intercâmbio" },
  { id: "cultura", emoji: "🎬", label: "Filmes, séries e música" },
  { id: "pessoas", emoji: "🤝", label: "Conhecer pessoas" },
  { id: "cerebro", emoji: "🧠", label: "Exercitar a mente" },
] as const;

export type Plan = {
  id: "free" | "monthly" | "yearly";
  name: string;
  price: string;
  period: string;
  highlight?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    features: [`${FREE_DAILY_LESSONS} lições por dia`, "Teste de nivelamento", "Trilha completa do A1 ao C1", "Correções em português"],
  },
  {
    id: "monthly",
    name: "Super Mensal",
    price: "R$ 39,90",
    period: "por mês",
    highlight: true,
    features: [
      "Lições e conversas ilimitadas",
      "Conversa livre sobre qualquer assunto",
      "Relatório detalhado a cada lição",
      "Caderno de vocabulário sem limites",
    ],
  },
  {
    id: "yearly",
    name: "Super Anual",
    price: "R$ 299,90",
    period: "por ano (≈ R$ 25/mês)",
    features: ["Tudo do Super Mensal", "37% de desconto", "Acesso antecipado a novidades"],
  },
];
