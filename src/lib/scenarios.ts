import type { Level } from "./levels";

export type Scenario = {
  id: string;
  emoji: string;
  title: string; // em português, para a interface
  description: string; // em português
  level: Level;
  // Instruções para a IA (em inglês)
  role: string;
  goal: string;
};

export type Unit = {
  level: Level;
  title: string;
  subtitle: string;
  color: { bg: string; border: string; text: string; soft: string };
};

export const UNITS: Unit[] = [
  {
    level: "A1",
    title: "Unidade 1 · Primeiros passos",
    subtitle: "Se apresentar, pedir coisas simples e falar do dia a dia",
    color: { bg: "bg-emerald-500", border: "border-emerald-700", text: "text-emerald-600", soft: "bg-emerald-50" },
  },
  {
    level: "A2",
    title: "Unidade 2 · Viajando",
    subtitle: "Aeroporto, hotel, restaurante e direções",
    color: { bg: "bg-sky-500", border: "border-sky-700", text: "text-sky-600", soft: "bg-sky-50" },
  },
  {
    level: "B1",
    title: "Unidade 3 · Contando histórias",
    subtitle: "Experiências, planos, opiniões e imprevistos",
    color: { bg: "bg-violet-500", border: "border-violet-700", text: "text-violet-600", soft: "bg-violet-50" },
  },
  {
    level: "B2",
    title: "Unidade 4 · Inglês no trabalho",
    subtitle: "Entrevistas, reuniões e negociações",
    color: { bg: "bg-amber-500", border: "border-amber-700", text: "text-amber-600", soft: "bg-amber-50" },
  },
  {
    level: "C1",
    title: "Unidade 5 · Fluência total",
    subtitle: "Debates, apresentações e conversas sofisticadas",
    color: { bg: "bg-rose-500", border: "border-rose-700", text: "text-rose-600", soft: "bg-rose-50" },
  },
];

export const SCENARIOS: Scenario[] = [
  // A1
  {
    id: "apresentacao",
    emoji: "👋",
    title: "Se apresentar",
    description: "Diga seu nome, de onde você é e do que gosta.",
    level: "A1",
    role: "a friendly new classmate meeting the student for the first time",
    goal: "get to know the student: name, city, job or studies, hobbies",
  },
  {
    id: "cafeteria",
    emoji: "☕",
    title: "Na cafeteria",
    description: "Peça um café e um lanche, pergunte o preço e pague.",
    level: "A1",
    role: "a barista at a coffee shop in New York",
    goal: "take the student's order, offer sizes and extras, tell the price and finish the payment",
  },
  {
    id: "familia",
    emoji: "👨‍👩‍👧",
    title: "Sua família",
    description: "Fale sobre as pessoas da sua família.",
    level: "A1",
    role: "a friendly neighbor",
    goal: "ask the student about their family members: names, ages, jobs, what they are like",
  },
  {
    id: "rotina",
    emoji: "🗓️",
    title: "Sua rotina",
    description: "Conte como é o seu dia, do café da manhã até a hora de dormir.",
    level: "A1",
    role: "a curious friend",
    goal: "ask the student about their daily routine, weekdays and weekends",
  },
  // A2
  {
    id: "aeroporto",
    emoji: "✈️",
    title: "No aeroporto",
    description: "Faça o check-in, despache a mala e passe pela imigração.",
    level: "A2",
    role: "an airline check-in agent and then an immigration officer in the USA",
    goal: "check the passport, ask about luggage, seat preference, purpose and length of the trip",
  },
  {
    id: "hotel",
    emoji: "🏨",
    title: "Check-in no hotel",
    description: "Confirme a reserva, peça informações e resolva um problema.",
    level: "A2",
    role: "a hotel receptionist",
    goal: "check the student in, explain breakfast and wifi, then handle a complaint about the room",
  },
  {
    id: "restaurante",
    emoji: "🍝",
    title: "No restaurante",
    description: "Peça pratos, resolva um problema e peça a conta.",
    level: "A2",
    role: "a waiter at a busy restaurant in London",
    goal: "seat the student, take the order, handle a small problem with the food, bring the bill",
  },
  {
    id: "direcoes",
    emoji: "🗺️",
    title: "Pedir direções",
    description: "Descubra como chegar a um lugar na cidade.",
    level: "A2",
    role: "a helpful local on a street in Toronto",
    goal: "help the student find a museum, a pharmacy and a subway station, giving directions and checking they understood",
  },
  // B1
  {
    id: "viagem",
    emoji: "🌎",
    title: "Contar uma viagem",
    description: "Fale sobre uma viagem que você fez usando o passado.",
    level: "B1",
    role: "a friend who loves travel stories",
    goal: "ask about a past trip in detail: where, with whom, what happened, best and worst moments",
  },
  {
    id: "planos",
    emoji: "🎉",
    title: "Planos do fim de semana",
    description: "Combine um programa com um amigo e negocie os detalhes.",
    level: "B1",
    role: "a friend trying to make weekend plans together",
    goal: "suggest activities, disagree politely, compare options and agree on time and place",
  },
  {
    id: "medico",
    emoji: "🩺",
    title: "Consulta médica",
    description: "Explique seus sintomas e entenda as orientações.",
    level: "B1",
    role: "a doctor at a walk-in clinic",
    goal: "ask about symptoms, how long, medication and allergies, then give simple advice",
  },
  {
    id: "reclamacao",
    emoji: "📦",
    title: "Reclamar de um produto",
    description: "Ligue para o suporte e resolva um pedido com defeito.",
    level: "B1",
    role: "a customer service agent of an online store",
    goal: "understand the problem with the student's order, ask for details and agree on a refund or replacement",
  },
  // B2
  {
    id: "entrevista",
    emoji: "💼",
    title: "Entrevista de emprego",
    description: "Responda perguntas clássicas de entrevista.",
    level: "B2",
    role: "a hiring manager at an international tech company",
    goal: "run a realistic job interview: background, strengths, weaknesses, a difficult situation, salary expectations",
  },
  {
    id: "reuniao",
    emoji: "📊",
    title: "Reunião de equipe",
    description: "Apresente um resultado e negocie um prazo.",
    level: "B2",
    role: "a project manager in a weekly team meeting",
    goal: "ask the student for a status update, challenge a deadline and negotiate a solution",
  },
  {
    id: "aluguel",
    emoji: "🏠",
    title: "Negociar o aluguel",
    description: "Visite um apartamento e negocie o preço.",
    level: "B2",
    role: "a landlord showing an apartment in Dublin",
    goal: "show the apartment, answer questions about bills and rules, and negotiate rent and contract length",
  },
  {
    id: "networking",
    emoji: "🥂",
    title: "Networking",
    description: "Puxe papo com desconhecidos num evento profissional.",
    level: "B2",
    role: "a professional at a networking event",
    goal: "make small talk, ask about the student's work, find common interests and exchange contacts naturally",
  },
  // C1
  {
    id: "debate",
    emoji: "🎙️",
    title: "Debate de ideias",
    description: "Defenda sua opinião sobre temas atuais.",
    level: "C1",
    role: "a sharp podcast host who likes to play devil's advocate",
    goal: "debate a current topic (remote work, AI, social media), asking the student to defend and refine their position",
  },
  {
    id: "pitch",
    emoji: "🚀",
    title: "Apresentar um projeto",
    description: "Convença um investidor a apostar na sua ideia.",
    level: "C1",
    role: "a skeptical investor",
    goal: "listen to the student's pitch, ask tough questions about market, risks and numbers, and push for clear answers",
  },
  {
    id: "noticias",
    emoji: "📰",
    title: "Comentar notícias",
    description: "Discuta uma notícia com nuances e argumentos.",
    level: "C1",
    role: "a well-read colleague at lunch",
    goal: "discuss a recent kind of news story the student picks, exploring causes, consequences and different viewpoints",
  },
  {
    id: "dilema",
    emoji: "⚖️",
    title: "Dilemas éticos",
    description: "Resolva situações difíceis explicando seu raciocínio.",
    level: "C1",
    role: "a philosophy professor",
    goal: "present ethical dilemmas one at a time and ask the student to argue, concede points and use hedging language",
  },
];

// Conversa livre: fora da trilha, exclusiva do plano Super.
export const FREE_TALK: Scenario = {
  id: "livre",
  emoji: "💬",
  title: "Conversa livre",
  description: "Converse sobre qualquer assunto que você quiser.",
  level: "A1",
  role: "a friendly English teacher",
  goal: "have a natural conversation about whatever the student wants to talk about",
};

export function getScenario(id: string) {
  return id === FREE_TALK.id ? FREE_TALK : SCENARIOS.find((s) => s.id === id);
}

export function lessonsOf(level: Level) {
  return SCENARIOS.filter((s) => s.level === level);
}
