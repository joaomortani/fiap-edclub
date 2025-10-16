import type { BadgeDTO } from '@edclub/shared';
import { supabase } from '../lib/supabase';

const USER_BADGES_TABLE = 'user_badges';

type BadgeDetails = {
  id: string;
  name: string;
  rule: string | null;
};

type BadgeRow = {
  badge_id: string;
  user_id: string;
  awarded_at: string;
  badges: BadgeDetails | null;
};

const mapBadge = (row: BadgeRow): BadgeDTO => {
  const badge = row.badges;

  return {
    id: badge?.id ?? row.badge_id,
    userId: row.user_id,
    name: badge?.name ?? 'Conquista EDClub',
    description: badge?.rule ?? 'Conquista registrada no EDClub.',
    iconUrl: null,
    earnedAt: row.awarded_at,
  };
};

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
    .select('badge_id, user_id, awarded_at, badges ( id, name, rule )')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as BadgeRow[];

  return rows.map(mapBadge);
}
