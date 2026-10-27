# Papo: aprenda inglês conversando

App web no estilo Duolingo para aprender inglês do A1 ao C1: lições rápidas geradas por IA e conversas por voz com o Kiko, a arara professora. A IA é o Claude, da Anthropic.

## O que já funciona

- **Onboarding**: motivação, meta diária e escolha entre começar do zero ou fazer o teste de nivelamento.
- **Teste de nivelamento**: 15 perguntas do A1 ao C1, que param quando o aluno não passa de um nível.
- **Trilha**: 5 unidades e 20 temas. Cada tema tem duas etapas:
  - **Lição**: 10 exercícios gerados pela IA (traduzir, montar frase, completar, ouvir e escolher, falar). As questões erradas voltam no fim, como no Duolingo.
  - **Conversa**: role-play por voz com o Kiko. Cada frase do aluno recebe uma correção, e ao final sai um relatório com nota, pontos fortes, pontos a melhorar e palavras novas.
- **Gamificação**: XP, ofensiva, meta diária, conquistas, sons, confetes e gráfico da semana.
- **Vocabulário**: as palavras de cada conversa ficam salvas, com áudio e revisão em cartões.
- **Planos**: grátis (4 lições por dia) e Super (ilimitado, com conversa livre). O pagamento ainda é só uma demonstração.
- **Voz**: o reconhecimento e a síntese de voz são os do próprio navegador e não têm custo. A fala funciona no Chrome, no Edge e no Safari; no Firefox, o aluno digita.

## Rodar no computador

1. Instale o Node.js 20 ou mais recente.
2. Copie o arquivo `.env.example` para `.env.local` e coloque a sua chave da API da Anthropic.
3. Instale as dependências e inicie o app:

```bash
npm install
npm run dev
```

4. Abra http://localhost:3000.

## Publicar na internet (Vercel)

1. Suba este projeto para um repositório no GitHub.
2. Em https://vercel.com, clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione `ANTHROPIC_API_KEY`.
4. Clique em **Deploy**.

## Onde mudar as coisas

| O quê | Arquivo |
|---|---|
| Nome do app, preços, limite grátis, XP | `src/lib/config.ts` |
| Unidades e temas da trilha | `src/lib/scenarios.ts` |
| Perguntas do nivelamento | `src/lib/placement.ts` |
| Instruções da IA (professor, exercícios, relatório) | `src/lib/prompts.ts` |
| Modelo e esforço da IA | variáveis `CLAUDE_MODEL` e `CLAUDE_EFFORT` |

## Próxima fase

- **Login e banco de dados** (por exemplo, Supabase): hoje o progresso fica salvo só no navegador do aluno.
- **Pagamento** (Stripe ou Mercado Pago, com cartão e Pix) e limite do plano grátis controlado no servidor.
- **Limite de uso por usuário** nas rotas da IA, para ninguém usar a sua chave sem controle.
- **Vozes premium** para o Kiko.
- **Versão para App Store e Google Play.**
