// Tipos das tabelas criadas em supabase/migrations/0001_init.sql.

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_until: string | null;
          pix_until: string | null;
          created_at: string;
        },
        "id"
      >;
      progress: Table<{ user_id: string; data: Record<string, unknown>; updated_at: string }, "user_id">;
      daily_usage: Table<{ user_id: string; day: string; lessons: number; messages: number }, "user_id" | "day">;
      payments: Table<
        { stripe_session_id: string; user_id: string; amount: number; currency: string; created_at: string },
        "stripe_session_id" | "user_id" | "amount" | "currency"
      >;
    };
    Views: Record<never, never>;
    Functions: {
      consume_usage: {
        Args: {
          p_user: string;
          p_lessons: number;
          p_messages: number;
          p_lesson_limit: number | null;
          p_message_limit: number | null;
        };
        Returns: boolean;
      };
      today_brt: { Args: Record<never, never>; Returns: string };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
