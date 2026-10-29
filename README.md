# Papo: aprenda inglês conversando

App web para aprender inglês do A1 ao C1 viajando pelo mundo: lições rápidas geradas por IA e conversas por voz com o Kiko, uma arara brasileira viajante. Cada cidade do roteiro é um nível, e cada etapa concluída vira um carimbo no passaporte. A IA é o Claude, da Anthropic. O login e o banco de dados usam o Supabase, e os pagamentos usam o Stripe (cartão e Pix).

## O que o app faz

- **Onboarding e nivelamento**: motivação, meta diária e teste de 15 perguntas do A1 ao C1.
- **Roteiro**: 5 cidades (Nova York, Londres, Dublin, Toronto e Sydney) e 20 paradas. Cada parada tem uma **lição** (10 exercícios gerados pela IA) e uma **conversa** por voz, com ajuste a cada frase e relatório no final.
- **Passaporte**: carimbos por cidade, XP, ofensiva, meta diária, conquistas, sons e confetes.
- **Vocabulário**: palavras salvas, com áudio e revisão em cartões.
- **Contas**: cadastro com e-mail e senha ou com o Google, recuperação de senha e progresso salvo na nuvem (aparece em qualquer aparelho).
- **Planos**:
  - Grátis: 4 lições por dia, controladas no servidor.
  - Super Mensal (R$ 19,99): cartão, com renovação automática e 7 dias grátis na primeira assinatura.
  - Super Anual (R$ 179,90): cartão (renovação automática, também com 7 dias grátis) ou Pix (pagamento único que vale 12 meses).
  - O aluno cancela ou troca o cartão sozinho pelo portal do Stripe.
- **Proteção de custo**: as rotas da IA exigem login e têm limite diário por aluno. Se a IA falhar, a lição não é descontada.

## Configuração (uma vez só)

### 1. Supabase (login e banco de dados)

1. Crie uma conta em https://supabase.com e um projeto novo. Escolha a região São Paulo.
2. Vá em **SQL Editor → New query**, cole todo o conteúdo de `supabase/migrations/0001_init.sql` e clique em **Run**.
3. Em **Authentication → URL Configuration**:
   - **Site URL**: o endereço do seu site (ex.: `https://papo.vercel.app`).
   - **Redirect URLs**: adicione `https://SEU-SITE/auth/callback` e `http://localhost:3000/auth/callback`.
4. Login com Google (opcional): em **Authentication → Sign In / Providers → Google**, siga as instruções da tela para criar as credenciais no Google Cloud. Depois coloque `NEXT_PUBLIC_GOOGLE_LOGIN=true` na Vercel para o botão aparecer.
5. Em **Project Settings → API Keys**, copie a URL do projeto, a chave *publishable* e a chave *secret*.

Os e-mails de confirmação e de nova senha podem ser traduzidos em **Authentication → Emails**.

### 2. Stripe (pagamentos)

1. Crie uma conta em https://stripe.com, com a empresa no Brasil.
2. Em **Product catalog**, crie o produto **Papo Super** com dois preços recorrentes:
   - R$ 19,99 por mês.
   - R$ 179,90 por ano.

   O teste de 7 dias grátis é aplicado pelo próprio app na primeira assinatura; não precisa configurar no preço.

   Copie o ID de cada preço (começa com `price_`).
3. Para aceitar Pix: em **Settings → Payment methods**, ative o **Pix** e depois coloque `STRIPE_PIX_ENABLED=true`.
4. Em **Settings → Billing → Customer portal**, ative o portal e salve. É por ele que o aluno cancela ou troca o cartão.
5. Em **Developers → Webhooks → Add endpoint**:
   - **URL**: `https://SEU-SITE/api/stripe/webhook`
   - **Eventos**: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated` e `customer.subscription.deleted`.

   Depois copie o **Signing secret**.
6. Comece no **modo de teste**, com as chaves `sk_test_`. Para testar, use o cartão `4242 4242 4242 4242`, qualquer validade futura e qualquer CVC. Quando tudo estiver certo, repita os passos no modo real.

### 3. Anthropic (IA)

Crie uma chave em https://console.anthropic.com/settings/keys.

### 4. Publicar na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em https://vercel.com, clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, cadastre todas as variáveis do `.env.example`.
4. Clique em **Deploy**. Depois atualize `NEXT_PUBLIC_SITE_URL`, a URL do Supabase e o webhook do Stripe com o endereço final.

## Rodar no computador

```bash
npm install
```

```bash
cp .env.example .env.local
```

Preencha o `.env.local` e rode:

```bash
npm run dev
```

Sem as variáveis do Supabase, o app roda em **modo demonstração** (sem login, com o progresso só no navegador). Isso funciona apenas no `npm run dev`; em produção, as rotas da IA exigem login.

## Onde mudar as coisas

| O quê | Arquivo |
|---|---|
| Nome do app, preços exibidos, limites dos planos, XP | `src/lib/config.ts` |
| Cidades e paradas do roteiro | `src/lib/scenarios.ts` |
| Perguntas do nivelamento | `src/lib/placement.ts` |
| Instruções da IA (professor, exercícios, relatório) | `src/lib/prompts.ts` |
| Tabelas e regras de acesso do banco | `supabase/migrations/0001_init.sql` |
| Modelo e esforço da IA | variáveis `CLAUDE_MODEL` e `CLAUDE_EFFORT` (padrão: Claude Haiku 5.5, esforço baixo) |

Se mudar os preços, mude o texto dos planos e `YEARLY_PRICE_CENTS` em `src/lib/config.ts` (usado no Pix) e os preços no Stripe. Os dias de teste grátis ficam em `TRIAL_DAYS`, no mesmo arquivo.

## Antes de lançar

- **Termos de Uso e Política de Privacidade**: a LGPD exige uma política de privacidade, porque o app guarda e-mail e progresso. Vale passar por um advogado.
- **Custo da IA**: o padrão é o Claude Haiku 5.5, que custa poucos centavos por aluno ao mês. Teste a qualidade das conversas com ele; se quiser respostas mais caprichadas, troque `CLAUDE_MODEL` por `claude-sonnet-5-5` sabendo que o custo sobe bastante. Acompanhe o gasto no console da Anthropic.
