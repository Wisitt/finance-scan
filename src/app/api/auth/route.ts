import { NextResponse } from 'next/server';

// รองรับการเรียก GET ที่ /api/auth
export async function GET(request: Request) {
  const url = new URL(request.url);
  // เก็บ query parameters ที่มาจาก request เดิม
  const searchParams = url.searchParams;
  
  // สร้าง URL ใหม่ที่จะ redirect ไปที่ callback/google
  const redirectUrl = new URL('/api/auth/callback/google', url.origin);
  
  // คัดลอก query parameters ทั้งหมดไปยัง URL ใหม่
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.append(key, value);
  });

  console.log(`Redirecting from /api/auth to ${redirectUrl.toString()}`);
  
  // สร้าง response ที่จะ redirect ไปยัง URL ที่ถูกต้อง
  return NextResponse.redirect(redirectUrl);
} 