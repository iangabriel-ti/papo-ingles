"use client";

import Link from "next/link";
import { Logo } from "@/components/AppShell";
import { Mascot } from "@/components/Mascot";
import { PricingCards } from "@/components/PricingCards";
import { LEVEL_INFO, LEVELS } from "@/lib/levels";
import { useProgress } from "@/lib/progress";
import { UNITS } from "@/lib/scenarios";

const FEATURES = [
  { icon: "🎙️", title: "Converse por voz", text: "Fale com o Kiko em situações reais: cafeteria, aeroporto, entrevista de emprego e muito mais." },
  { icon: "✏️", title: "Correção na hora", text: "Cada frase que você fala recebe uma dica de como dizer melhor, explicada em português." },
  { icon: "⚡", title: "Lições rápidas", text: "Exercícios de 3 minutos para aprender as palavras antes de cada conversa." },
  { icon: "🔥", title: "Vício do bem", text: "Ofensiva, XP, meta diária e conquistas para você não largar o inglês." },
];

const FAQ = [
  {
    q: "Preciso saber inglês para começar?",
    a: "Não. A Unidade 1 começa do zero e o Kiko fala devagar, com frases curtas e tradução em um toque.",
  },
  {
    q: "Como funciona a conversa por voz?",
    a: "Você toca no microfone e fala em inglês. O Kiko entende, responde em voz alta e mostra como melhorar sua frase. Também dá para digitar.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim! Funciona direto no navegador do celular ou do computador, sem instalar nada. Para falar, use o Chrome, o Edge ou o Safari.",
  },
  {
    q: "Qual é a diferença entre o grátis e o Super?",
    a: "No grátis você faz algumas lições por dia. No Super as lições são ilimitadas e você ganha a conversa livre sobre qualquer assunto.",
  },
];

export default function Home() {
  const { progress, loaded } = useProgress();
  const startHref = loaded && progress.onboarded ? "/aprender" : "/comecar";

  return (
    <div className="overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b-2 border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <Link href={startHref} className="btn btn-white px-4 py-2 text-xs">
            {loaded && progress.onboarded ? "Continuar" : "Entrar"}
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
        <div className="relative mx-auto">
          <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-brand-50" />
          <Mascot size={280} mood="talking" className="animate-bob" />
          <div className="absolute -right-6 top-6 animate-pop rounded-2xl border-2 border-line bg-white px-4 py-2 font-extrabold shadow-sm">
            Hi! How are you? 👋
          </div>
          <div className="absolute -left-8 bottom-10 animate-pop rounded-2xl bg-brand-500 px-4 py-2 font-extrabold text-white shadow-sm [animation-delay:0.3s]">
            I&apos;m great, thanks!
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">
            O jeito divertido de <span className="text-brand-500">falar inglês</span> de verdade.
          </h1>
          <p className="mt-4 text-lg font-semibold text-muted">
            Lições rápidas, conversas por voz com IA e correções na hora. Do básico ao avançado, em poucos minutos por dia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
            <Link href={startHref} className="btn btn-primary py-4 text-base">
              {loaded && progress.onboarded ? "Continuar aprendendo" : "Começar agora, é grátis"}
            </Link>
            {!(loaded && progress.onboarded) && (
              <Link href="/comecar" className="btn btn-white">
                Já sei um pouco: fazer o nivelamento
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* recursos */}
      <section className="border-y-2 border-line bg-[#fafbff] py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-black">Aprenda falando, não decorando</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card border-b-4 p-6">
                <span className="text-4xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-black">{f.title}</h3>
                <p className="mt-2 text-sm font-semibold text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* exemplo de conversa */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-black">Uma professora no seu bolso, 24 horas por dia</h2>
          <p className="mt-4 font-semibold text-muted">
            Sem vergonha de errar: o Kiko tem paciência infinita. Ele adapta o vocabulário ao seu nível, corrige com carinho e
            mostra sugestões quando você não sabe o que dizer.
          </p>
        </div>
        <div className="card space-y-4 border-b-4 p-5">
          <div className="flex items-end gap-2">
            <Mascot size={40} />
            <p className="rounded-2xl rounded-bl-md border-2 border-line px-4 py-2.5 font-semibold">Hi! What can I get for you today?</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="rounded-2xl rounded-br-md bg-brand-500 px-4 py-2.5 font-semibold text-white">I want a coffee big, please</p>
            <div className="max-w-[90%] rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-sm">
              <p className="font-black uppercase text-amber-600">Dica de correção</p>
              <p className="font-bold">I&apos;d like a large coffee, please.</p>
              <p className="font-semibold text-muted">Em inglês o adjetivo vem antes do substantivo, e “I&apos;d like” soa mais educado.</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Mascot size={40} mood="talking" />
            <p className="rounded-2xl rounded-bl-md border-2 border-line px-4 py-2.5 font-semibold">Sure! Hot or iced?</p>
          </div>
        </div>
      </section>

      {/* níveis */}
      <section className="border-y-2 border-line bg-[#fafbff] py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-black">Uma trilha do zero à fluência</h2>
          <p className="mt-3 text-center font-semibold text-muted">5 unidades seguindo o padrão internacional CEFR, com 40 etapas.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-5">
            {LEVELS.map((level, i) => (
              <div key={level} className={`rounded-2xl border-b-4 ${UNITS[i].color.bg} ${UNITS[i].color.border} p-5 text-white`}>
                <p className="text-3xl font-black">{level}</p>
                <p className="font-extrabold">{LEVEL_INFO[level].name}</p>
                <p className="mt-2 text-sm font-semibold opacity-90">{UNITS[i].subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* planos */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-black">Comece grátis. Evolua com o Super.</h2>
        <PricingCards startHref={startHref} />
      </section>

      {/* perguntas */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="mb-6 text-center text-3xl font-black">Perguntas frequentes</h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold">
                {item.q}
                <span className="text-muted transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 font-semibold text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-brand-500 py-16 text-center text-white">
        <Mascot size={110} mood="celebrate" className="mx-auto" />
        <h2 className="mt-4 px-4 text-3xl font-black">Bora destravar seu inglês?</h2>
        <Link href={startHref} className="btn btn-white mt-8 px-10 py-4 text-base">
          Começar agora
        </Link>
      </section>

      <footer className="py-8 text-center text-sm font-semibold text-muted">© {new Date().getFullYear()} Papo · Feito para quem quer falar inglês</footer>
    </div>
  );
}
