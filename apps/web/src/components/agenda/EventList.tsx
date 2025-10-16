"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventDTO } from "@edclub/shared";
import { listEvents } from "../../lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const formatEventRange = (event: EventDTO) => {
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return "Horário indisponível";
  }

  const sameDay =
    startsAt.getFullYear() === endsAt.getFullYear() &&
    startsAt.getMonth() === endsAt.getMonth() &&
    startsAt.getDate() === endsAt.getDate();

  if (sameDay) {
    return `${dateFormatter.format(startsAt)} — ${dateFormatter.format(endsAt)}`;
  }

  return `${dateFormatter.format(startsAt)} até ${dateFormatter.format(endsAt)}`;
};

type EventListProps = {
  teamId?: string;
  refreshKey?: number;
};

export function EventList({ teamId, refreshKey }: EventListProps) {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const emptyStateMessage = useMemo(() => {
    if (isLoading) {
      return "Carregando eventos...";
    }

    if (error) {
      return error;
    }

    return "Nenhum evento cadastrado até o momento.";
  }, [error, isLoading]);

  useEffect(() => {
    let isActive = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await listEvents(teamId);

        if (isActive) {
          setEvents(result);
        }
      } catch (err) {
        if (!isActive) {
          return;
        }

        setEvents([]);
        setError(
          err instanceof Error
            ? `Não foi possível carregar os eventos. ${err.message}`
            : "Não foi possível carregar os eventos.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isActive = false;
    };
  }, [teamId, refreshKey]);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-slate-400">
          {emptyStateMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">{formatEventRange(event)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
