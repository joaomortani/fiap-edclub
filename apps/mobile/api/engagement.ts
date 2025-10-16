import { apiRequest } from './client';

type RankResponse = {
  rank: Array<{
    userId: string;
    presents: number;
    total: number;
    percent: number;
  }>;
};

type ProgressResponse = {
  progress: {
    presents: number;
    total: number;
    percent: number;
  };
};

export async function getWeeklyRank() {
  const response = await apiRequest<RankResponse>('/api/engagement/rank');
  return response.rank;
}

export async function getWeeklyProgress() {
  const response = await apiRequest<ProgressResponse>('/api/engagement/progress');
  return response.progress;
}
