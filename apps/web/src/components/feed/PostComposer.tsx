"use client";

import { FormEvent, useState } from "react";

import { Button } from "../ui/Button";

export type PostComposerProps = {
  onPublish: (content: string) => Promise<void> | void;
  isPublishing?: boolean;
};

export function PostComposer({ onPublish, isPublishing = false }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      setError("Escreva algo antes de publicar.");
      return;
    }

    try {
      setError(null);
      await onPublish(trimmed);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar.");
    }
  };

  return (
    <form className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="post-content">
          Compartilhe uma novidade
        </label>
        <textarea
          id="post-content"
          className="min-h-[120px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="O que está acontecendo por aí?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isPublishing}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex justify-end">
        <Button disabled={isPublishing || !content.trim()} type="submit">
          {isPublishing ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  );
}
