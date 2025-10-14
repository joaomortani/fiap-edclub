import type { BadgeDTO } from '@edclub/shared';
import { supabase } from '../lib/supabase';

const USER_BADGES_TABLE = 'user_badges';

type BadgeRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon_url: string | null;
  earned_at: string;
};

const mapBadge = (row: BadgeRow): BadgeDTO => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  description: row.description,
  iconUrl: row.icon_url,
  earnedAt: row.earned_at,
});

export async function listMyBadges(): Promise<BadgeDTO[]> {
  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const userId = userResult?.user?.id;

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from(USER_BADGES_TABLE)
    .select('id, user_id, name, description, icon_url, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as BadgeRow[];

  return rows.map(mapBadge);
}
