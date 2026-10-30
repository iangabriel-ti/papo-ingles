// Configurações gerais do produto. Mude aqui o nome, os limites e os preços.

export const APP_NAME = "Papo";
export const APP_TAGLINE = "Aprenda inglês conversando de verdade, do básico ao avançado.";
export const MASCOT_NAME = "Kiko";

// Quantas respostas do aluno completam uma lição.
export const LESSON_TURNS = 6;

// Quantas lições (exercícios ou conversa) por dia o plano grátis permite.
export const FREE_DAILY_LESSONS = 4;

// Teto de chamadas à IA por dia, para proteger o custo contra abusos.
// Uma conversa usa cerca de 8 chamadas; uma lição de exercícios, 1.
export const DAILY_AI_CALLS = { free: 60, premium: 400 };

// Preços em centavos, usados no pagamento via Pix (o cartão usa os preços do Stripe).
export const YEARLY_PRICE_CENTS = 17990;

// Dias de teste grátis na primeira assinatura no cartão.
export const TRIAL_DAYS = 7;

// XP ganho em cada atividade.
export const XP_EXERCISE_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_CONVERSATION = 20;
export const XP_REVIEW = 15;

// Endereço da revisão do dia (usa a mesma tela das lições).
export const REVIEW_ID = "revisao";

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
    features: [`${FREE_DAILY_LESSONS} lições por dia`, "Teste de nivelamento", "Roteiro completo do A1 ao C1", "Correções em português"],
  },
  {
    id: "monthly",
    name: "Super Mensal",
    price: "R$ 19,99",
    period: "por mês",
    highlight: true,
    features: [
      `${TRIAL_DAYS} dias grátis para testar`,
      "Lições e conversas ilimitadas",
      "Conversa livre sobre qualquer assunto",
      "Relatório detalhado a cada conversa",
    ],
  },
  {
    id: "yearly",
    name: "Super Anual",
    price: "R$ 179,90",
    period: "por ano (≈ R$ 15/mês)",
    features: ["Tudo do Super Mensal", "Economize 25%", "Pague no cartão ou no Pix"],
  },
];
