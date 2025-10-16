"use client";

import { useEffect, useMemo, useState } from "react";

import { getWeeklyRank } from "../../lib/api/engagement";

const truncateIdentifier = (value: string) => {
  if (!value) {
    return "Usuário";
  }

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}…${value.slice(-4)}`;
};

type RankEntry = {
  userId: string;
  presents: number;
  total: number;
  percent: number;
};

export default function WeeklyRank() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRank = async () => {
      try {
        setIsLoading(true);
        const rank = await getWeeklyRank();

        if (!isMounted) {
          return;
        }

        setEntries(rank);
        setHasError(false);
      } catch (error) {
        if (isMounted) {
          console.error('Erro ao carregar ranking semanal', error);
          setHasError(true);
          setEntries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRank();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(() => {
    return entries.map((entry, index) => ({
      ...entry,
      label: truncateIdentifier(entry.userId),
      icon: index === 0 ? "🏆" : "⭐",
      rank: index + 1,
    }));
  }, [entries]);

  if (isLoading) {
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

  if (hasError) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        Não foi possível carregar o ranking desta semana.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        Nenhuma presença registrada nesta semana ainda. Participe dos eventos para aparecer aqui!
      </div>
    );
  }

  return (
    <ol className="space-y-3" aria-live="polite">
      {items.map((item) => (
        <li
          key={item.userId}
          className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 shadow-lg shadow-slate-950/40"
        >
          <span className="text-xl" aria-hidden>{item.icon}</span>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold text-slate-100">{item.label}</span>
            <span className="text-xs text-slate-400">
              {item.presents} de {item.total} presenças
            </span>
          </div>
          <span className="text-sm font-semibold text-emerald-400">{item.percent.toFixed(1)}%</span>
        </li>
      ))}
    </ol>
  );
}
