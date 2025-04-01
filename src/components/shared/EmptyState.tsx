import { FileText } from 'lucide-react';

export default function EmptyState({ title = 'ไม่พบข้อมูล', message }: { title?: string; message?: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {message || 'ไม่มีรายการตรงกับเงื่อนไข ลองเปลี่ยนตัวกรองดูนะ'}
      </p>
    </div>
  );
}
