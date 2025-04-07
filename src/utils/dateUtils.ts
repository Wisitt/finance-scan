
import { format, formatDistance, isValid, parseISO } from 'date-fns';
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
export function formatToShortDate(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'd MMM yyyy', { locale: th });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function timeAgo(date: Date | string, addSuffix = true): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return formatDistance(dateObj, new Date(), {
      addSuffix,
      locale: th
    });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Unknown time';
  }
}

export function formatThaiDate(date: Date | string, formatStr = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: th });
  } catch (error) {
    console.error('Error formatting Thai date:', error);
    return 'Invalid date';
  }
}

export function isToday(date: Date | string): boolean {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

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

export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'; // Handle null/undefined
  try {
    const dateObj = parseISO(dateString); // Best for YYYY-MM-DD
    if (isValid(dateObj)) {
      return format(dateObj, "d MMM yy", { locale: th });
    }
  } catch { }
  // Fallback for potentially different formats or invalid strings
  try {
    const dateObj = new Date(dateString);
    if (isValid(dateObj)) {
      return format(dateObj, "d MMM yy", { locale: th });
    }
  } catch { }
  return 'Invalid Date'; // Or return the original string: dateString
}