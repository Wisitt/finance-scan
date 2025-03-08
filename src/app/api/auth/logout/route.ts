import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  
  // รับรายการคุกกี้ทั้งหมดที่เกี่ยวข้องกับ NextAuth
  const nextAuthCookies = cookieStore.getAll()
    .filter(cookie => cookie.name.startsWith('next-auth'));
  
  // สร้าง response และใช้มันในการลบคุกกี้
  const response = NextResponse.json({ success: true });
  
  // ลบคุกกี้โดยตั้งค่า cookie ใหม่ที่มีเวลาหมดอายุในอดีต
  for (const cookie of nextAuthCookies) {
    response.cookies.delete(cookie.name);
  }
  
  return response;
}