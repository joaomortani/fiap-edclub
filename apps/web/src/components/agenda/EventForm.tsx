"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { EventDTO, Role } from "@edclub/shared";
import { createEvent } from "../../lib/api/events";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const initialFormState = {
  title: "",
  startsAt: "",
  endsAt: "",
};

type EventFormProps = {
  role: Role;
  teamId?: string;
  onCreated?: (event: EventDTO) => void;
};

export function EventForm({ role, teamId, onCreated }: EventFormProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (role !== "teacher") {
    return null;
  }

  const handleChange = (field: keyof typeof initialFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const validate = () => {
    if (!formData.title.trim()) {
      return "Informe um título para o evento.";
    }

    if (!formData.startsAt) {
      return "Informe a data e hora de início.";
    }

    if (!formData.endsAt) {
      return "Informe a data e hora de término.";
    }

    const startsAt = new Date(formData.startsAt);
    const endsAt = new Date(formData.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      return "Datas inválidas. Verifique os valores informados.";
    }

    if (startsAt > endsAt) {
      return "A data de término deve ser posterior ao início.";
    }

    if (!teamId) {
      return "Não foi possível identificar a turma para criação do evento.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createEvent({
        teamId: teamId!,
        title: formData.title.trim(),
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
      });

      setSuccessMessage("Evento criado com sucesso!");
      setFormData(initialFormState);
      onCreated?.(created);
    } catch (err) {
      setSuccessMessage(null);
      setError(
        err instanceof Error
          ? `Não foi possível criar o evento. ${err.message}`
          : "Não foi possível criar o evento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="title">
          Título
        </label>
        <Input
          id="title"
          placeholder="Aula de revisão"
          value={formData.title}
          onChange={handleChange("title")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="startsAt">
            Início
          </label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={formData.startsAt}
            onChange={handleChange("startsAt")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="endsAt">
            Término
          </label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={formData.endsAt}
            onChange={handleChange("endsAt")}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : successMessage ? (
        <p className="text-sm text-emerald-400">{successMessage}</p>
      ) : null}

      <div>
        <Button className="bg-blue-500 hover:bg-blue-400" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Salvando..." : "Criar evento"}
        </Button>
      </div>
    </form>
  );
}
