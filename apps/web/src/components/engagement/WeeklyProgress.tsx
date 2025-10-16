"use client";

import { useEffect, useState } from "react";
import { getWeeklyProgress } from "../../lib/api/engagement";

type WeeklyProgressState = {
  presents: number;
  total: number;
  percent: number;
};

const INITIAL_STATE: WeeklyProgressState = {
  presents: 0,
  total: 0,
  percent: 0,
};

const clampPercent = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
};

export default function WeeklyProgress() {
  const [progress, setProgress] = useState<WeeklyProgressState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const response = await getWeeklyProgress();

        if (!isMounted) {
          return;
        }

        setProgress({
          presents: response.presents ?? 0,
          total: response.total ?? 0,
          percent: clampPercent(response.percent ?? 0),
        });
        setHasError(false);
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setProgress(INITIAL_STATE);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-800/60" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-800/60" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/60" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        Não foi possível carregar seu progresso semanal agora. Tente novamente mais tarde.
      </div>
    );
  }

  const displayPercent = progress.total === 0 ? 0 : clampPercent(progress.percent);
  const legend = `${progress.presents}/${progress.total}`;

  return (
    <section className="space-y-3" aria-live="polite">
      <header className="flex items-center justify-between text-sm font-medium text-slate-300">
        <span>Progresso da semana</span>
        <span className="text-base font-semibold text-slate-100">{displayPercent.toFixed(1)}%</span>
      </header>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label="Progresso de presença semanal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayPercent)}
      >
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${displayPercent}%` }}
        />
      </div>
      <p className="text-xs font-medium text-slate-400">Presenças registradas: {legend}</p>
    </section>
  );
}
