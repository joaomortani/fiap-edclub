import type { PostDTO } from '@edclub/shared';

import { apiRequest } from './http';

type PostResponse = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type ListPostsResponse = {
  posts: PostResponse[];
};

type CreatePostResponse = {
  post: PostResponse;
};

const mapPost = (post: PostResponse): PostDTO => ({
  id: post.id,
  userId: post.user_id,
  content: post.content,
  createdAt: post.created_at
});

export async function listPosts(): Promise<PostDTO[]> {
  const response = await apiRequest<ListPostsResponse>('/api/posts');
  return response.posts.map(mapPost);
}

export async function createPost(content: string): Promise<PostDTO> {
  const response = await apiRequest<CreatePostResponse>('/api/posts', {
    method: 'POST',
    body: { content }
  });

  return mapPost(response.post);
}
