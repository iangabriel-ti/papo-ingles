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

// Cada unidade é uma cidade do roteiro; cada etapa concluída vira um carimbo.
export type Unit = {
  level: Level;
  city: string;
  code: string; // sigla do carimbo
  title: string;
  subtitle: string;
};

export const UNITS: Unit[] = [
  { level: "A1", city: "Nova York", code: "NY", title: "Primeiros passos", subtitle: "Se apresentar, pedir coisas simples e falar do dia a dia" },
  { level: "A2", city: "Londres", code: "LDN", title: "Viajando", subtitle: "Aeroporto, hotel, restaurante e direções" },
  { level: "B1", city: "Dublin", code: "DUB", title: "Contando histórias", subtitle: "Experiências, planos, opiniões e imprevistos" },
  { level: "B2", city: "Toronto", code: "TOR", title: "Inglês no trabalho", subtitle: "Entrevistas, reuniões e negociações" },
  { level: "C1", city: "Sydney", code: "SYD", title: "Fluência total", subtitle: "Debates, apresentações e conversas sofisticadas" },
];

export function unitOf(level: Level) {
  return UNITS.find((u) => u.level === level)!;
}

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

  // Paradas extras de cada cidade (aparecem depois das quatro primeiras).
  // A1
  {
    id: "mercado",
    emoji: "🛒",
    title: "No mercado",
    description: "Encontre produtos, pergunte preços e pague no caixa.",
    level: "A1",
    role: "a friendly supermarket employee and then the cashier",
    goal: "help the student find a few groceries, say where things are and how much they cost, then ring them up",
  },
  {
    id: "clima",
    emoji: "🌤️",
    title: "Falar do tempo",
    description: "Puxe conversa sobre o clima e os planos do dia.",
    level: "A1",
    role: "a neighbor waiting for the elevator",
    goal: "make small talk about today's weather, what the student likes to do on sunny and rainy days, and their plans for today",
  },
  {
    id: "metro",
    emoji: "🚇",
    title: "Pegar o metrô",
    description: "Compre o bilhete e descubra qual linha pegar.",
    level: "A1",
    role: "a subway station attendant",
    goal: "sell the student a ticket, tell them which line to take and how many stops, and answer simple questions",
  },
  {
    id: "roupas",
    emoji: "👕",
    title: "Comprar roupas",
    description: "Peça tamanhos e cores, experimente e pague.",
    level: "A1",
    role: "a shop assistant in a clothing store",
    goal: "help the student choose a piece of clothing: size, color, fitting room, price and payment",
  },
  // A2
  {
    id: "farmacia",
    emoji: "💊",
    title: "Na farmácia",
    description: "Explique um sintoma simples e entenda como usar o remédio.",
    level: "A2",
    role: "a pharmacist",
    goal: "ask about the student's simple symptom, recommend something over the counter and explain how and when to take it",
  },
  {
    id: "cambio",
    emoji: "💷",
    title: "Trocar dinheiro",
    description: "Troque reais por libras e entenda as taxas.",
    level: "A2",
    role: "a clerk at a currency exchange counter",
    goal: "exchange the student's money: amount, rate, fee, ID check and how they want the notes",
  },
  {
    id: "ingressos",
    emoji: "🎟️",
    title: "Comprar ingressos",
    description: "Escolha sessão, lugares e pague os ingressos de um show.",
    level: "A2",
    role: "a box office attendant at a theater",
    goal: "sell tickets for a show: date and time, number of people, seats, price and payment",
  },
  {
    id: "convite",
    emoji: "📅",
    title: "Fazer um convite",
    description: "Convide um amigo para sair e combine dia e hora.",
    level: "A2",
    role: "a friend from an English class",
    goal: "receive the student's invitation, ask questions, suggest a different time once and agree on the plan",
  },
  // B1
  {
    id: "trabalho",
    emoji: "🧑‍💻",
    title: "Falar do seu trabalho",
    description: "Explique o que você faz, do que gosta e seus desafios.",
    level: "B1",
    role: "a curious person at a party",
    goal: "ask the student about their job or studies: daily tasks, what they like, a challenge and future goals",
  },
  {
    id: "filme",
    emoji: "🎬",
    title: "Recomendar um filme",
    description: "Conte a história de um filme ou série e dê sua opinião.",
    level: "B1",
    role: "a friend looking for something to watch",
    goal: "ask the student to recommend a film or series: plot without spoilers, characters, why they liked it, and compare opinions",
  },
  {
    id: "voo-cancelado",
    emoji: "🛫",
    title: "Voo cancelado",
    description: "Remarque a viagem e peça seus direitos no balcão.",
    level: "B1",
    role: "an airline agent at the service desk",
    goal: "deal with the student's cancelled flight: alternatives, hotel voucher, meal voucher and confirming the new booking",
  },
  {
    id: "vizinho",
    emoji: "🏢",
    title: "Problema com o vizinho",
    description: "Resolva um barulho na madrugada com educação.",
    level: "B1",
    role: "a neighbor who plays loud music late at night",
    goal: "let the student politely complain, react a bit defensively at first, then agree on a fair solution",
  },
  // B2
  {
    id: "resultados",
    emoji: "📈",
    title: "Apresentar resultados",
    description: "Apresente números do trimestre e responda perguntas.",
    level: "B2",
    role: "a senior director listening to a quarterly results presentation",
    goal: "ask the student to present their results, interrupt with probing questions about numbers and next steps",
  },
  {
    id: "feedback",
    emoji: "🗣️",
    title: "Dar e receber feedback",
    description: "Converse sobre desempenho de forma clara e respeitosa.",
    level: "B2",
    role: "the student's manager in a performance review",
    goal: "give the student balanced feedback, ask for their self-assessment and agree on development goals together",
  },
  {
    id: "cliente",
    emoji: "📞",
    title: "Ligação com cliente",
    description: "Acalme um cliente irritado e proponha uma solução.",
    level: "B2",
    role: "an upset client on the phone about a delayed delivery",
    goal: "complain firmly about the delay, test the student's patience and accept a concrete, well-explained solution",
  },
  {
    id: "salario",
    emoji: "💼",
    title: "Negociar salário",
    description: "Discuta uma proposta de emprego e negocie condições.",
    level: "B2",
    role: "a recruiter making a job offer",
    goal: "present an offer, push back reasonably on the student's requests and negotiate salary, start date and benefits",
  },
  // C1
  {
    id: "painel",
    emoji: "🎤",
    title: "Painel de conferência",
    description: "Responda como especialista diante de uma plateia.",
    level: "C1",
    role: "a moderator of a professional conference panel",
    goal: "introduce the student as an expert in their field, ask demanding questions and a tricky audience question",
  },
  {
    id: "mediacao",
    emoji: "🤝",
    title: "Mediar um conflito",
    description: "Ajude dois colegas a chegarem a um acordo.",
    level: "C1",
    role: "one of two colleagues in a heated disagreement (you also voice the other colleague briefly)",
    goal: "present both sides of a workplace conflict and let the student mediate, using diplomatic and tactful language",
  },
  {
    id: "historia",
    emoji: "📖",
    title: "Contar uma história",
    description: "Narre algo marcante com humor, detalhes e ritmo.",
    level: "C1",
    role: "a friend at dinner who loves a good story",
    goal: "ask the student for a memorable personal story, react naturally and push for vivid details, feelings and a punchline",
  },
  {
    id: "explicar",
    emoji: "🧠",
    title: "Explicar algo complexo",
    description: "Explique um tema da sua área para um leigo.",
    level: "C1",
    role: "a smart teenager with no background in the student's field",
    goal: "ask the student to explain a complex topic from their field, ask naive but sharp follow-up questions until it is clear",
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
