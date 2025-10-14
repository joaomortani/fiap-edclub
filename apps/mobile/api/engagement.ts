import { supabase } from '../lib/supabase';

type WeeklyRankRow = {
  user_id: string;
  presents: number;
  total: number;
  percent: number | string | null;
};

type WeeklyProgressRow = {
  presents: number | null;
  total: number | null;
  percent: number | string | null;
};

const WEEKLY_RANK_VIEW = 'weekly_attendance_rank';
const WEEKLY_PROGRESS_FUNCTION = 'get_weekly_progress';

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export async function getWeeklyRank(): Promise<{
  userId: string;
  presents: number;
  total: number;
  percent: number;
}[]> {
  const { data, error } = await supabase
    .from<WeeklyRankRow>(WEEKLY_RANK_VIEW)
    .select('user_id, presents, total, percent');

  if (error) {
    throw error;
  }

  const rows = (data ?? []).map((row) => ({
    userId: row.user_id,
    presents: row.presents ?? 0,
    total: row.total ?? 0,
    percent: toNumber(row.percent),
  }));

  return rows.sort((a, b) => {
    if (b.percent !== a.percent) {
      return b.percent - a.percent;
    }

    if (b.presents !== a.presents) {
      return b.presents - a.presents;
    }

    return a.userId.localeCompare(b.userId);
  });
}

export async function getWeeklyProgress(): Promise<{
  presents: number;
  total: number;
  percent: number;
}> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const userId = userResult?.user?.id;

  if (!userId) {
    return { presents: 0, total: 0, percent: 0 };
  }

  const { data, error } = await supabase.rpc<WeeklyProgressRow[]>(WEEKLY_PROGRESS_FUNCTION, {
    uid: userId,
  });

  if (error) {
    throw error;
  }

  const [row] = data ?? [];
  const presents = row?.presents ?? 0;
  const total = row?.total ?? 0;
  const percent = total === 0 ? 0 : toNumber(row?.percent);

  return { presents, total, percent };
}
