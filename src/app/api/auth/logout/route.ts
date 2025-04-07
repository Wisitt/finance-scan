// /app/api/auth/logout/route.ts (สมมติเป็นไฟล์ logout)
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();

  const nextAuthCookies = cookieStore
    .getAll()
    .filter((cookie: { name: string; value: string }) =>
      cookie.name.startsWith('next-auth')
    );

  const response = NextResponse.json({ success: true });
  for (const cookie of nextAuthCookies) {
    response.cookies.delete(cookie.name);
  }

  return response;
}
