"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { EventDTO } from "@edclub/shared";

import { listEvents, markAttendance } from "../../lib/api/events";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

type AttendanceEvent = EventDTO & {
  isPresent: boolean;
  isSubmitting: boolean;
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export function AttendanceList() {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const allEvents = await listEvents();
        if (!isMounted) {
          return;
        }

        const todaysEvents = allEvents
          .filter((event) => {
            const start = new Date(event.startsAt);
            return isToday(start);
          })
          .map((event) => ({
            ...event,
            isPresent: false,
            isSubmitting: false,
          }));

        setEvents(todaysEvents);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        setError("Não foi possível carregar os eventos de hoje.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkAttendance = useCallback(async (eventId: string) => {
    setError(null);

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, isPresent: true, isSubmitting: true }
          : event,
      ),
    );

    try {
      await markAttendance(eventId, "present");
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, isPresent: true, isSubmitting: false }
            : event,
        ),
      );
    } catch (attendanceError) {
      console.error(attendanceError);
      setError("Não foi possível marcar sua presença. Tente novamente.");
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, isPresent: false, isSubmitting: false }
            : event,
        ),
      );
    }
  }, []);

  const content = useMemo(() => {
    if (isLoading) {
      return <p className="text-sm text-slate-400">Carregando eventos...</p>;
    }

    if (events.length === 0) {
      return (
        <p className="text-sm text-slate-400">
          Você não possui eventos agendados para hoje.
        </p>
      );
    }

    return (
      <ul className="space-y-4">
        {events.map((event) => {
          const startsAt = new Date(event.startsAt);
          const endsAt = new Date(event.endsAt);

          return (
            <li key={event.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">{event.title}</p>
                <p className="text-sm text-slate-400">
                  {timeFormatter.format(startsAt)} - {timeFormatter.format(endsAt)}
                </p>
              </div>
              <Button
                onClick={() => handleMarkAttendance(event.id)}
                disabled={event.isPresent || event.isSubmitting}
              >
                {event.isPresent ? "Presença registrada" : "Marcar presença"}
              </Button>
            </li>
          );
        })}
      </ul>
    );
  }, [events, handleMarkAttendance, isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presença de hoje</CardTitle>
        <p className="text-sm text-slate-400">
          Visualize seus eventos do dia e registre sua presença.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : null}
        {content}
      </CardContent>
    </Card>
  );
}
