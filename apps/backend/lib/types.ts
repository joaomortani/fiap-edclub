export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      attendances: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: 'present' | 'absent' | 'late';
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status: 'present' | 'absent' | 'late';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['attendances']['Insert']>;
      };
      badges: {
        Row: {
          id: string;
          name: string;
          rule: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          team_id: string | null;
          title: string;
          starts_at: string;
          ends_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
        };
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          awarded_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          awarded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>;
      };
    };
    Views: {
      weekly_attendance_rank: {
        Row: {
          user_id: string;
          presents: number | null;
          total: number | null;
          percent: number | null;
        };
      };
    };
    Functions: {
      get_weekly_progress: {
        Args: {
          uid: string;
        };
        Returns: {
          presents: number | null;
          total: number | null;
          percent: number | null;
        }[];
      };
    };
  };
};
