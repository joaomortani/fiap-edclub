import type { PostDTO } from "@edclub/shared";

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PostListProps = {
  posts: PostDTO[];
  isLoading?: boolean;
};

export function PostList({ posts, isLoading = false }: PostListProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-400">Carregando publicações...</p>;
  }

  if (posts.length === 0) {
    return <p className="text-sm text-slate-400">Ainda não há publicações por aqui.</p>;
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40"
        >
          <p className="whitespace-pre-wrap text-sm text-slate-100">{post.content}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
            Publicado em {formatDate(post.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
