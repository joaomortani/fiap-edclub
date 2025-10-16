import type { BadgeDTO } from '@edclub/shared';

import { apiRequest } from './http';

type BadgeResponse = {
  id: string;
  name: string;
  description?: string | null;
  icon_url?: string | null;
  awardedAt: string | null;
};

type ListBadgesResponse = {
  badges: BadgeResponse[];
};

const mapBadge = (badge: BadgeResponse): BadgeDTO => ({
  id: badge.id,
  name: badge.name,
  description: badge.description ?? '',
  iconUrl: badge.icon_url ?? null,
  earnedAt: badge.awardedAt ?? ''
});

export async function listMyBadges(): Promise<BadgeDTO[]> {
  const response = await apiRequest<ListBadgesResponse>('/api/badges');
  return response.badges.map(mapBadge);
}
