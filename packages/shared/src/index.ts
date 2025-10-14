export type Role = 'student' | 'teacher';

export type EventDTO = {
  id: string;
  teamId: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

export type PostDTO = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type BadgeDTO = {
  id: string;
  userId: string;
  name: string;
  description: string;
  iconUrl: string | null;
  earnedAt: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'late';
