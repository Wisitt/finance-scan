'use client';

import { useSession } from "next-auth/react";

export default function DefaultDashboard() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ดหลัก</h1>
      <p>ยินดีต้อนรับ, {session?.user?.name}!</p>
      <p>คุณได้เข้าสู่ระบบแล้ว นี่คือหน้าแดชบอร์ดหลักของคุณ</p>
    </div>
  );
} 