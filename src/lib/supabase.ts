import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

export async function checkAndLogAuthStatus() {
  console.log('==========================================');
  console.log('🔍 Checking Supabase Auth Status');
  
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else {
      console.log('✅ Session data:', {
        hasSession: !!sessionData?.session,
        expiresAt: sessionData?.session?.expires_at ? 
          new Date(sessionData.session.expires_at * 1000).toLocaleString() : 'N/A',
        user: sessionData?.session?.user?.id || 'No user in session'
      });
    }
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
    } else {
      console.log('✅ User data:', {
        hasUser: !!userData?.user,
        userId: userData?.user?.id || 'No user',
        email: userData?.user?.email || 'No email',
        metadata: userData?.user?.user_metadata || 'No metadata'
      });
    }
  } catch (err) {
    console.error('❌ Unexpected error checking auth:', err);
  }
  
  console.log('==========================================');
  
  if (typeof window !== 'undefined') {
    try {
      const supabaseLocalStorageKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      console.log('🔑 Supabase localStorage keys:', supabaseLocalStorageKeys);
    } catch (e) {
      console.error('❌ Error inspecting localStorage:', e);
    }
  }
}

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('receipt-images')
      .upload(`receipts/${userId}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error || !data?.path) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('receipt-images')
      .getPublicUrl(`receipts/${userId}/${fileName}`);

    if (!urlData?.publicUrl) return null;
    return urlData.publicUrl;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
}

export async function deleteImageFromUrl(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname.split('/storage/v1/object/public/')[1]);
    const { error } = await supabase.storage.from('receipts').remove([path]);
    if (error) {
      console.warn('ลบรูปไม่สำเร็จ:', error.message);
    }
  } catch {
      console.error('ไม่สามารถแยก path รูปจาก URL:', url);
  }
}