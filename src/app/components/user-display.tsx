'use client';

import { Card, CardContent } from "@/components/ui/card";

export default function UserDisplay() {
  const currentDate = "";
  const username = "";
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): <span className="font-semibold">{currentDate}</span>
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Current User&apos;s Login: <span className="font-semibold">{username}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}