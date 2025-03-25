export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-medium">กำลังโหลด</h2>
        <p className="text-muted-foreground mt-2">กรุณารอสักครู่...</p>
      </div>
    </div>
  );
} 