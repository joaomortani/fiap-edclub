"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Role } from "@edclub/shared";
import { EventForm } from "../../components/agenda/EventForm";
import { EventList } from "../../components/agenda/EventList";

const DEFAULT_TEAM_ID = process.env.NEXT_PUBLIC_DEFAULT_TEAM_ID;

const resolveRole = (value: string | null): Role => {
  if (value === "teacher") {
    return "teacher";
  }

  return "student";
};

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
        <h1 className="text-3xl font-semibold">Agenda</h1>
        <p className="text-slate-600">
          Acompanhe seus compromissos e eventos importantes nesta área.
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Próximos eventos</h2>
          <EventList refreshKey={refreshKey} teamId={teamId} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Criar novo evento</h2>
          <EventForm onCreated={handleEventCreated} role={role} teamId={teamId} />
          {role !== "teacher" ? (
            <p className="text-sm text-slate-500">
              Apenas professores podem criar novos eventos. Acesse como professor para utilizar o formulário.
            </p>
          ) : !teamId ? (
            <p className="text-sm text-slate-500">
              Informe uma turma para cadastrar eventos adicionando o parâmetro <code>?teamId=</code> à URL ou configure a
              variável <code>NEXT_PUBLIC_DEFAULT_TEAM_ID</code>.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
