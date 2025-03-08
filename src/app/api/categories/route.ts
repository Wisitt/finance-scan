import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create a Supabase client for the route handler
const createSupabaseClient = () => {
  const cookieStore = cookies();
  
  // Try to use auth-helpers client first (for authenticated requests)
  try {
    return createRouteHandlerClient({ cookies: () => cookieStore });
  } catch (e) {
    // Fallback to direct client if auth setup fails
    console.warn('Using direct Supabase client:', e);
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
};

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}