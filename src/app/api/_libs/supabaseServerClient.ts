import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createRouteHandlerClient(
    { cookies: () => cookieStore }
  );
}