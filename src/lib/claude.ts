import Anthropic from "@anthropic-ai/sdk";

// Modelo usado nas lições e conversas: o Haiku é rápido e barato o bastante para o
// plano de R$ 19,99. Pode ser trocado pela variável de ambiente CLAUDE_MODEL
// (por exemplo "claude-sonnet-5-5" ou "claude-opus-5-5") sem mexer no código.
export const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-5-5";

// Conversa casual responde bem com esforço baixo: mais rápido e mais barato.
export const EFFORT = (process.env.CLAUDE_EFFORT || "low") as "low" | "medium" | "high";

// Se o modelo recusar um pedido por política de segurança, a API tenta de novo
// em outro modelo automaticamente. O Haiku não tem essa opção.
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export function fallbackOptions(): { betas?: string[]; fallbacks?: "default" } {
  return /^claude-(opus|sonnet|fable)-/.test(MODEL) ? { betas: [FALLBACK_BETA], fallbacks: "default" } : {};
}

let client: Anthropic | null = null;

export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

export function textOf(content: Anthropic.Beta.BetaContentBlock[]) {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// Converte erros da API em mensagens para o aluno, sem expor detalhes internos.
export function friendlyError(error: unknown): { message: string; status: number } {
  if (error instanceof Anthropic.AuthenticationError) {
    return { message: "A chave da API está inválida. Avise o suporte.", status: 500 };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { message: "Muita gente conversando agora. Tente de novo em alguns segundos.", status: 429 };
  }
  if (error instanceof Anthropic.BadRequestError) {
    console.error("Claude bad request:", error.message);
    return { message: "Não consegui processar essa mensagem. Tente reformular.", status: 400 };
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`Claude API error ${error.status}:`, error.message);
    return { message: "A professora está indisponível no momento. Tente de novo.", status: 502 };
  }
  console.error(error);
  return { message: "Algo deu errado. Tente de novo.", status: 500 };
}
