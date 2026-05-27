import type { SupabaseClient } from "jsr:@supabase/supabase-js@2.49.8";

export type Variables = {
  supabase: SupabaseClient;
};

export type AppEnv = { Variables: Variables };
