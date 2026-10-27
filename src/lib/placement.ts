import { LEVELS, type Level } from "./levels";

export type Question = {
  level: Level;
  prompt: string;
  sentence?: string;
  options: string[];
  answer: number; // índice da opção correta
};

// 3 perguntas por nível, da mais fácil para a mais difícil.
export const QUESTIONS: Question[] = [
  { level: "A1", prompt: "Complete a frase:", sentence: "Hi! My name ___ Ana.", options: ["am", "is", "are", "be"], answer: 1 },
  { level: "A1", prompt: "Qual é a resposta certa para “How are you?”", options: ["I'm 25.", "I'm fine, thanks.", "I'm from Brazil.", "I'm a teacher."], answer: 1 },
  { level: "A1", prompt: "Complete a frase:", sentence: "They ___ students.", options: ["is", "am", "are", "be"], answer: 2 },

  { level: "A2", prompt: "Complete a frase:", sentence: "Yesterday I ___ to the supermarket.", options: ["go", "went", "gone", "going"], answer: 1 },
  { level: "A2", prompt: "Complete a frase:", sentence: "There aren't ___ apples in the fridge.", options: ["some", "any", "much", "a"], answer: 1 },
  { level: "A2", prompt: "Complete a frase:", sentence: "She is ___ than her brother.", options: ["tall", "more tall", "taller", "tallest"], answer: 2 },

  { level: "B1", prompt: "Complete a frase:", sentence: "I ___ in São Paulo since 2018.", options: ["live", "am living", "have lived", "lived"], answer: 2 },
  { level: "B1", prompt: "Complete a frase:", sentence: "If it rains tomorrow, we ___ at home.", options: ["stay", "will stay", "would stay", "stayed"], answer: 1 },
  { level: "B1", prompt: "O que significa “I'm looking forward to the trip”?", options: ["Estou procurando a viagem.", "Estou ansioso pela viagem.", "Estou olhando fotos da viagem.", "Estou adiando a viagem."], answer: 1 },

  { level: "B2", prompt: "Complete a frase:", sentence: "If I had known about the meeting, I ___ earlier.", options: ["would come", "will come", "would have come", "had come"], answer: 2 },
  { level: "B2", prompt: "Complete a frase:", sentence: "The report ___ by the time the manager arrives.", options: ["will finish", "will have been finished", "is finishing", "has finished"], answer: 1 },
  { level: "B2", prompt: "Qual palavra completa melhor?", sentence: "We need to ___ a decision by Friday.", options: ["do", "make", "take on", "get"], answer: 1 },

  { level: "C1", prompt: "Complete a frase:", sentence: "Hardly ___ the office when it started to pour.", options: ["I had left", "had I left", "I left", "did I left"], answer: 1 },
  { level: "C1", prompt: "O que significa “to cut corners”?", options: ["Economizar fazendo algo de forma malfeita", "Pegar um atalho no caminho", "Cortar custos de forma inteligente", "Interromper alguém"], answer: 0 },
  { level: "C1", prompt: "Qual frase soa mais natural e formal?", options: ["I want you to send me the file.", "Would you mind sending me the file?", "Send me the file, please, now.", "You must send me the file."], answer: 1 },
];

// O nível é o mais alto em que o aluno acertou pelo menos 2 de 3, sem pular níveis.
export function levelFromAnswers(answers: number[]): Level {
  let result: Level = "A1";
  for (const level of LEVELS) {
    const questions = QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => q.level === level);
    const correct = questions.filter(({ q, i }) => answers[i] === q.answer).length;
    if (correct >= 2) result = level;
    else break;
  }
  return result;
}
