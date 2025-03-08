import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin environment variables');
}

// Admin client สำหรับฝั่ง server เท่านั้น (มีสิทธิ์เต็ม)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);