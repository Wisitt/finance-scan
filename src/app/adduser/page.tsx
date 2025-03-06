'use client';

import { useEffect, useState } from 'react';
import ReceiptScanner from "../components/ReceiptScanner";

export default function ScanPage() {
  // Use client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show a simple loading state until client-side code takes over
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Loading scanner...</div>
      </div>
    );
  }

  return <ReceiptScanner />;
}