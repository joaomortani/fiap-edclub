import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const highlights = [
    {
      title: "Feed cheio de energia",
      description:
        "Descubra desafios, eventos e conquistas da galera em tempo real para manter a vibe lá em cima.",
    },
    {
      title: "Agenda no seu ritmo",
      description:
        "Monte treinos, lembretes e encontros com poucos cliques e receba alertas para não perder nenhum rolê ativo.",
    },
    {
      title: "Comunidade que motiva",
      description:
        "Troque ideias com outros estudantes, compartilhe evoluções e encontre seu squad para o próximo treino.",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-8 py-14 shadow-xl shadow-slate-950/50">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200 shadow-sm ring-1 ring-blue-400/30">
              <span className="h-2 w-2 rounded-full bg-blue-300" aria-hidden />
              Clube em movimento
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Chega mais, bora treinar com o EDClub!
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">
              Aqui é o ponto de encontro da galera que ama energia boa. Acompanhe o que está bombando, organize seus treinos e
              descubra novas experiências para manter o corpo e a mente em jogo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/feed"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Ver novidades
              </Link>
              <Link
                href="/agenda"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-transparent px-6 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800/70 hover:text-white"
              >
                Montar minha agenda
              </Link>
            </div>
          </div>
          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
            <Image
              src="/active-hero.svg"
              alt="Pessoa se exercitando"
              width={420}
              height={420}
              priority
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.title}
            className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 transition hover:-translate-y-1 hover:shadow-slate-950/60"
          >
            <h2 className="text-lg font-semibold text-slate-100">{highlight.title}</h2>
            <p className="text-sm leading-6 text-slate-300">{highlight.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
