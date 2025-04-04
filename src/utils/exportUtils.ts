import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

/**
 * Exports transaction data to CSV format
 */
export function exportTransactionsToCSV(transactions: Transaction[]): void {
  if (!transactions.length) {
    toast.error('ไม่มีข้อมูลที่จะส่งออก', {
      description: 'โปรดตรวจสอบว่ามีข้อมูลธุรกรรมก่อนส่งออก'
    });
    return;
  }
  
  try {
    // Create header row
    const header = 'วันที่,ประเภท,หมวดหมู่,รายละเอียด,จำนวนเงิน\n';
    
    // Create data rows
    const rows = transactions
      .map((tx) => {
        const date = format(parseISO(tx.date), 'yyyy-MM-dd');
        const type = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
        const amount = tx.amount;
        // Escape fields that might contain commas or quotes
        const description = tx.description ? `"${tx.description.replace(/"/g, '""')}"` : '""';
        const category = tx.category ? `"${tx.category.replace(/"/g, '""')}"` : '""';
        
        return `${date},${type},${category},${description},${amount}`;
      })
      .join('\n');
    
    // Create blob and download
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('ส่งออกข้อมูลสำเร็จ', {
      description: `ไฟล์ ${fileName} ถูกดาวน์โหลดแล้ว`
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล', {
      description: 'โปรดลองอีกครั้งในภายหลัง'
    });
  }
}

/**
 * Exports transaction data to Excel format (XLSX)
 */
export function exportTransactionsToExcel(transactions: Transaction[]): void {
  if (!transactions.length) {
    toast.error('ไม่มีข้อมูลที่จะส่งออก');
    return;
  }
  
  // This is a placeholder - actual Excel export would require a library like xlsx or exceljs
  toast.info('ฟังก์ชันนี้ยังไม่พร้อมใช้งาน', {
    description: 'ขออภัย ฟังก์ชันการส่งออกเป็น Excel ยังอยู่ระหว่างการพัฒนา'
  });
}

/**
 * Export transaction data to JSON format
 */
export function exportTransactionsToJSON(transactions: Transaction[]): void {
  if (!transactions.length) {
    toast.error('ไม่มีข้อมูลที่จะส่งออก');
    return;
  }
  
  try {
    const data = JSON.stringify(transactions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('ส่งออกข้อมูล JSON สำเร็จ');
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
  }
}