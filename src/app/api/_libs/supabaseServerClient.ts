// /app/api/_libs/supabaseServerClient.ts (ตัวอย่างการตั้งชื่อไฟล์)
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = cookies();

  try {
    return createRouteHandlerClient/* <Database> */({
      cookies: () => cookieStore,
    });
  } catch (err) {
    console.warn('Using direct Supabase client due to an error:', err);
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}
