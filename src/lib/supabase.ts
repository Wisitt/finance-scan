import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ฟังก์ชันสำหรับอัปโหลดไฟล์ภาพไปยัง Supabase Storage
export async function uploadImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;
    
    const { error } = await supabase.storage
      .from('receipt-images')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // สร้าง public URL สำหรับรูปภาพ
    const { data } = supabase.storage
      .from('receipt-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}