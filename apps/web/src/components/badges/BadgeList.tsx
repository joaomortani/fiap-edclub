"use client";

import { useEffect, useState } from "react";
import type { BadgeDTO } from "@edclub/shared";

import { listMyBadges } from "../../lib/api/badges";

const formatEarnedDate = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch (error) {
    return isoDate;
  }
};

export function BadgeList() {
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const response = await listMyBadges();

        if (!isMounted) {
          return;
        }

        setBadges(response);
        setHasError(false);
      } catch (error) {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBadges();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando conquistas...</p>;
  }

  if (hasError) {
    return (
      <p className="text-sm text-red-500">
        Não foi possível carregar suas conquistas agora. Tente novamente em instantes.
      </p>
    );
  }

  if (badges.length === 0) {
    return <p className="text-sm text-slate-500">Você ainda não possui badges conquistadas.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {badges.map((badge) => (
        <li
          key={badge.id}
          className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          {badge.iconUrl ? (
            <img
              src={badge.iconUrl}
              alt={`Ícone do badge ${badge.name}`}
              className="h-12 w-12 flex-none rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-slate-100 text-xl">
              🏅
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">{badge.name}</p>
            <p className="text-sm text-slate-600">{badge.description}</p>
            <p className="text-xs text-slate-400">
              Conquistado em {formatEarnedDate(badge.earnedAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
