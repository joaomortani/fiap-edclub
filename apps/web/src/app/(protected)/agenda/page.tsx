"use client";

import { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { Role } from "@edclub/shared";

import { EventForm } from "@/components/agenda/EventForm";
import { EventList } from "@/components/agenda/EventList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const DEFAULT_TEAM_ID = process.env.NEXT_PUBLIC_DEFAULT_TEAM_ID;

const resolveRole = (value: string | null): Role => {
  if (value === "teacher") {
    return "teacher";
  }

  return "student";
};

const WeeklyRank = dynamic(() => import("@/components/engagement/WeeklyRank"), {
  ssr: false,
  suspense: true,
});

function WeeklyRankFallback() {
  return (
    <ul className="space-y-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800/60" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/60" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-slate-800/60" />
        </li>
      ))}
    </ul>
  );
}

export default function AgendaPage() {
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const role = useMemo(() => resolveRole(searchParams?.get("role") ?? null), [searchParams]);
  const teamId = searchParams?.get("teamId") ?? DEFAULT_TEAM_ID ?? undefined;

  const handleEventCreated = () => {
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Agenda</h1>
        <p className="text-slate-300">
          Acompanhe seus compromissos e eventos importantes nesta área.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Próximos eventos</h2>
            <EventList refreshKey={refreshKey} teamId={teamId} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Criar novo evento</h2>
            <EventForm onCreated={handleEventCreated} role={role} teamId={teamId} />
            {role !== "teacher" ? (
              <p className="text-sm text-slate-400">
                Apenas professores podem criar novos eventos. Acesse como professor para utilizar o formulário.
              </p>
            ) : !teamId ? (
              <p className="text-sm text-slate-400">
                Informe uma turma para cadastrar eventos adicionando o parâmetro <code>?teamId=</code> à URL ou configure a
                variável <code>NEXT_PUBLIC_DEFAULT_TEAM_ID</code>.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<WeeklyRankFallback />}>
                <WeeklyRank />
              </Suspense>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
