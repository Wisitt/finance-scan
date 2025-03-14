import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // อนุญาตเฉพาะผู้ใช้ที่มี Token
    },
  }
);

export const config = {
  matcher: ["/api/:path*"], // ใช้ Middleware เฉพาะ API Routes
};
