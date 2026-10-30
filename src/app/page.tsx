"use client";

import Link from "next/link";
import { Logo } from "@/components/AppShell";
import { BoltIcon, MicIcon, PassportIcon, PencilIcon } from "@/components/Icons";
import { Mascot } from "@/components/Mascot";
import { PricingCards } from "@/components/PricingCards";
import { Stamp } from "@/components/Stamp";
import { TRIAL_DAYS } from "@/lib/config";
import { LEVEL_INFO } from "@/lib/levels";
import { PATH } from "@/lib/path";
import { useProgress } from "@/lib/progress";
import { UNITS } from "@/lib/scenarios";

const FEATURES = [
  { Icon: MicIcon, title: "Converse por voz", text: "Fale com o Kiko em situações reais: cafeteria, aeroporto, hotel, entrevista de emprego e muito mais." },
  { Icon: PencilIcon, title: "Ajuste na hora", text: "Cada frase que você fala recebe a forma mais natural de dizer, explicada em português." },
  { Icon: BoltIcon, title: "Lições de 3 minutos", text: "Exercícios rápidos com as palavras de cada lugar, antes de você encarar a conversa." },
  { Icon: PassportIcon, title: "Um passaporte para carimbar", text: "Cada etapa vira um carimbo. Ofensiva, meta diária e conquistas te mantêm no ritmo." },
];

const FAQ = [
  {
    q: "Preciso saber inglês para começar?",
    a: "Não. A viagem começa em Nova York, do zero, e o Kiko fala devagar, com frases curtas e tradução em um toque.",
  },
  {
    q: "Como funciona a conversa por voz?",
    a: "Você toca no microfone e fala em inglês. O Kiko entende, responde em voz alta e mostra como melhorar a sua frase. Também dá para digitar.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim! Funciona direto no navegador do celular ou do computador, sem instalar nada. Para falar, use o Chrome, o Edge ou o Safari.",
  },
  {
    q: "Como funciona o teste grátis do Super?",
    a: `Você tem ${TRIAL_DAYS} dias para usar tudo sem limites. Se cancelar antes, não paga nada. Depois são R$ 19,99 por mês, e dá para cancelar quando quiser.`,
  },
];

export default function Home() {
  const { progress, loaded } = useProgress();
  const returning = loaded && progress.onboarded;
  const startHref = returning ? "/aprender" : "/comecar";

  return (
    <div className="overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <Link href={returning ? "/aprender" : "/entrar?modo=entrar"} className="btn btn-white px-5 py-2 text-sm">
            {returning ? "Continuar" : "Entrar"}
          </Link>
        </div>
      </header>

      {/* destaque */}
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24">
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-sun-700">Inglês do A1 ao C1</p>
          <h1 className="heading mt-3 text-4xl leading-[1.1] md:text-[56px]">
            Sua passagem para <span className="text-sun-500">falar inglês</span> de verdade.
          </h1>
          <p className="mt-5 text-lg text-muted">
            Viaje pelo mundo com o Kiko, uma arara brasileira que conversa com você por voz, corrige na hora e mostra o
            caminho, em poucos minutos por dia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
            <Link href={startHref} className="btn btn-primary py-4 text-base">
              {returning ? "Continuar viagem" : "Começar grátis"}
            </Link>
            {!returning && (
              <Link href="/comecar" className="btn btn-white">
                Já sei um pouco: fazer o nivelamento
              </Link>
            )}
          </div>
        </div>

        {/* cartão de embarque */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="rotate-2 overflow-hidden rounded-3xl bg-brand-500 text-paper shadow-[0_24px_60px_rgba(15,61,94,0.25)]">
            <div className="flex items-center justify-between px-6 pt-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">Cartão de embarque</span>
              <span className="text-xs text-brand-100">PAPO 001</span>
            </div>
            <div className="flex items-end justify-between px-6 pt-4">
              <div>
                <p className="font-display text-4xl font-extrabold">GRU</p>
                <p className="text-xs text-brand-100">São Paulo</p>
              </div>
              <span className="mb-3 h-0 flex-1 border-t-2 border-dashed border-brand-300 mx-4" />
              <div className="text-right">
                <p className="font-display text-4xl font-extrabold">NYC</p>
                <p className="text-xs text-brand-100">Nova York</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4 border-t border-dashed border-brand-300/50 bg-brand-600 px-6 py-5">
              <Mascot hat mood="talking" size={88} className="animate-bob shrink-0" />
              <div className="text-sm">
                <p className="rounded-2xl rounded-bl-md bg-paper px-3 py-2 text-ink">Hi! Where are you from?</p>
                <p className="mt-2 rounded-2xl rounded-br-md bg-sun-500 px-3 py-2 text-ink">I&apos;m from Brazil!</p>
              </div>
            </div>
          </div>
          <Stamp code="NY" state="done" size={84} className="absolute -bottom-6 -left-4 bg-paper text-2xl" />
        </div>
      </section>

      {/* recursos */}
      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="heading text-center text-3xl">Aprenda falando, não decorando</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="card bg-paper p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-paper">
                  <Icon size={24} />
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-brand-500">{title}</h3>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* exemplo de conversa */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="heading text-3xl">Um professor no bolso, 24 horas por dia</h2>
          <p className="mt-4 text-muted">
            Sem vergonha de errar: o Kiko tem paciência infinita. Ele adapta o vocabulário ao seu nível, mostra o jeito
            certo de dizer e dá sugestões quando você não sabe o que responder.
          </p>
        </div>
        <div className="card space-y-4 p-5">
          <div className="flex items-end gap-2">
            <Mascot size={40} />
            <p className="rounded-3xl rounded-bl-md border border-line px-4 py-2.5">Hi! What can I get for you today?</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="rounded-3xl rounded-br-md bg-brand-500 px-4 py-2.5 text-paper">I want a coffee big, please</p>
            <div className="max-w-[90%] rounded-2xl border-2 border-dashed border-sun-500 px-4 py-2.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-sun-700">Ajuste de rota</p>
              <p className="mt-1 font-semibold">I&apos;d like a large coffee, please.</p>
              <p className="text-muted">Em inglês o adjetivo vem antes do substantivo, e “I&apos;d like” soa mais educado.</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Mascot size={40} mood="talking" />
            <p className="rounded-3xl rounded-bl-md border border-line px-4 py-2.5">Sure! Hot or iced?</p>
          </div>
        </div>
      </section>

      {/* roteiro */}
      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="heading text-center text-3xl">Cinco cidades, do zero à fluência</h2>
          <p className="mt-3 text-center text-muted">Um roteiro no padrão internacional CEFR, com {PATH.length} carimbos para conquistar.</p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-5">
            {UNITS.map((unit) => (
              <li key={unit.level} className="card flex flex-col items-center bg-paper p-5 text-center">
                <Stamp code={unit.code} state="done" size={64} />
                <p className="mt-4 font-display text-lg font-extrabold text-brand-500">{unit.city}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-sun-700">
                  {unit.level} · {LEVEL_INFO[unit.level].name}
                </p>
                <p className="mt-2 text-sm text-muted">{unit.subtitle}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* planos */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="heading text-center text-3xl">Comece grátis. Viaje mais longe com o Super.</h2>
        <p className="mt-3 text-center text-muted">{TRIAL_DAYS} dias grátis no Super, sem compromisso.</p>
        <div className="mt-10">
          <PricingCards startHref={startHref} />
        </div>
      </section>

      {/* perguntas */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="heading mb-6 text-center text-3xl">Perguntas frequentes</h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {item.q}
                <span className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-brand-500 py-16 text-center text-paper">
        <Mascot hat size={110} mood="celebrate" className="mx-auto" />
        <h2 className="mt-4 px-4 font-display text-3xl font-extrabold">Bora embarcar?</h2>
        <Link href={startHref} className="btn btn-primary mt-8 px-10 py-4 text-base">
          Começar agora
        </Link>
      </section>

      <footer className="py-8 text-center text-sm text-muted">© {new Date().getFullYear()} Papo · Sua passagem para falar inglês</footer>
    </div>
  );
}
