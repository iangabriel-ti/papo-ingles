-- Papo: tabelas de usuários, progresso, uso diário e pagamentos.
-- Rode este arquivo no Supabase em SQL Editor → New query → Run.

-- Perfil de cada usuário, criado automaticamente no cadastro.
-- Só o servidor (chave secreta) altera os campos de assinatura.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  -- Assinatura recorrente no cartão: válida até o fim do período pago.
  subscription_until timestamptz,
  -- Plano anual pago via Pix: válido até esta data.
  pix_until timestamptz,
  created_at timestamptz not null default now()
);

-- Progresso do aluno (XP, ofensiva, trilha, vocabulário...) em JSON.
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Quanto cada usuário usou da IA por dia, para aplicar os limites dos planos.
create table public.daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  lessons integer not null default 0,
  messages integer not null default 0,
  primary key (user_id, day)
);

-- Pagamentos avulsos (Pix) já processados, para não liberar acesso duas vezes.
create table public.payments (
  stripe_session_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  currency text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.daily_usage enable row level security;
alter table public.payments enable row level security;

create policy "Usuário vê o próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Usuário vê o próprio progresso" on public.progress
  for select using (auth.uid() = user_id);
create policy "Usuário cria o próprio progresso" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "Usuário atualiza o próprio progresso" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuário vê o próprio uso" on public.daily_usage
  for select using (auth.uid() = user_id);

create policy "Usuário vê os próprios pagamentos" on public.payments
  for select using (auth.uid() = user_id);

-- Cria o perfil quando alguém se cadastra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Dia atual no horário de Brasília (os limites zeram à meia-noite).
create function public.today_brt()
returns date
language sql
stable
as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

-- Registra uso da IA de forma atômica. Devolve false (sem registrar nada)
-- se o pedido ultrapassar algum limite. Limite nulo = sem limite.
create function public.consume_usage(
  p_user uuid,
  p_lessons integer,
  p_messages integer,
  p_lesson_limit integer,
  p_message_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_usage (user_id, day)
  values (p_user, public.today_brt())
  on conflict do nothing;

  update public.daily_usage
  set lessons = lessons + p_lessons,
      messages = messages + p_messages
  where user_id = p_user
    and day = public.today_brt()
    and (p_lesson_limit is null or lessons + p_lessons <= p_lesson_limit)
    and (p_message_limit is null or messages + p_messages <= p_message_limit);

  return found;
end;
$$;

-- Só o servidor pode chamar a função de uso.
revoke execute on function public.consume_usage(uuid, integer, integer, integer, integer) from public;
revoke execute on function public.consume_usage(uuid, integer, integer, integer, integer) from anon, authenticated;
grant execute on function public.consume_usage(uuid, integer, integer, integer, integer) to service_role;
