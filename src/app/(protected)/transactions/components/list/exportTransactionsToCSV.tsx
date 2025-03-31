import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Transaction } from '@/types';

export function exportTransactionsToCSV(transactions: Transaction[]) {
  if (!transactions.length) {
    toast.error('ไม่มีข้อมูลที่จะส่งออก');
    return;
  }
  
  const header = 'วันที่,ประเภท,หมวดหมู่,รายละเอียด,จำนวนเงิน\n';
  const rows = transactions
    .map((tx) => {
      const date = format(parseISO(tx.date), 'yyyy-MM-dd');
      const type = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
      const desc = tx.description?.replace(/"/g, '""') || '';
      const cat = tx.category?.replace(/"/g, '""') || '';
      return `${date},${type},"${cat}","${desc}",${tx.amount}`;
    })
    .join('\n');
    
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  
  toast.success('ส่งออกข้อมูลสำเร็จ');
}