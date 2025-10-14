import type { PostDTO } from '@edclub/shared';
import { supabase } from '../supabase';

const POSTS_TABLE = 'posts';

type PostRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

const mapPost = (row: PostRow): PostDTO => ({
  id: row.id,
  userId: row.user_id,
  content: row.content,
  createdAt: row.created_at,
});

export async function listPosts(): Promise<PostDTO[]> {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select<PostRow>('id, user_id, content, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPost);
}

export async function createPost(content: string): Promise<PostDTO> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const userId = userResult?.user?.id;

  if (!userId) {
    throw new Error('Usuário não autenticado.');
  }

  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .insert<PostRow>({
      user_id: userId,
      content,
    })
    .select<PostRow>('id, user_id, content, created_at')
    .single();

  if (error || !data) {
    throw error ?? new Error('Post não pôde ser criado.');
  }

  return mapPost(data);
}
