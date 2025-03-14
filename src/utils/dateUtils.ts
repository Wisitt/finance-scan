/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, parseISO, isValid } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * แปลงวันที่เป็นรูปแบบ ISO string (YYYY-MM-DD)
 */
export function formatToISODate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * แปลงวันที่เป็นรูปแบบ UTC string (YYYY-MM-DD HH:MM:SS)
 */
export function formatToUTCString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return format(d, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทย (วันที่ เดือน ปีพศ)
 */
export function formatToThaiDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(d)) return 'วันที่ไม่ถูกต้อง';
  
  // เพิ่ม 543 ปีเพื่อแปลงเป็น พ.ศ.
  return format(d, 'd MMMM yyyy', { locale: th })
    .replace(String(d.getFullYear()), String(d.getFullYear() + 543));
}

/**
 * แปลงวันที่ให้อยู่ในรูปแบบที่กำหนด
 */
export const formatToShortDate = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, 'dd MMM yyyy');
};

export const formatThaiFullDate = (date: Date): string => {
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
/**
 * คำนวณช่วงวันที่ในเดือนปัจจุบัน
 */
export function getCurrentMonthRange(): { start: string, end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: formatToISODate(start),
    end: formatToISODate(end)
  };
}