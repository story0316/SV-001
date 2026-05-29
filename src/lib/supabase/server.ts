import { createClient } from "@supabase/supabase-js";

// 서버(API route)용 클라이언트 — service role key로 RLS 우회
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
