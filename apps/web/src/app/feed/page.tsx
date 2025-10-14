"use client";

import { useCallback, useEffect, useState } from "react";

import type { PostDTO } from "@edclub/shared";

import { PostComposer } from "@/components/feed/PostComposer";
import { PostList } from "@/components/feed/PostList";
import { createPost, listPosts } from "@/lib/api/posts";

export default function FeedPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listPosts();
      setPosts(data);
      setError(null);
    } catch {
      setError("Não foi possível carregar as publicações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handlePublish = useCallback(
    async (content: string) => {
      try {
        setIsPublishing(true);
        await createPost(content);
        await loadPosts();
      } catch (err) {
        throw err instanceof Error ? err : new Error("Não foi possível publicar.");
      } finally {
        setIsPublishing(false);
      }
    },
    [loadPosts],
  );

  return (
    <section className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Feed</h1>
        <p className="text-slate-600">
          Confira as novidades da comunidade acadêmica e fique por dentro das atualizações.
        </p>
      </div>

      <PostComposer isPublishing={isPublishing} onPublish={handlePublish} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <PostList isLoading={isLoading} posts={posts} />
    </section>
  );
}
