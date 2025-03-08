import {format, isToday, isYesterday, isSameWeek, isSameMonth } from 'date-fns';

// Thai Date Formatting
export const formatThaiMonth = (date: Date): string => {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  
  return `${day} ${month} ${year}`;
};

export const formatThaiShortDate = (date: Date): string => {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  
  return `${day} ${month} ${year.toString().substring(2)}`;
};

// Format currency consistently
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Group transactions by date
export const getGroupTitle = (date: Date): string => {
  const today = new Date();
  
  if (isToday(date)) {
    return 'วันนี้';
  } else if (isYesterday(date)) {
    return 'เมื่อวาน';
  } else if (isSameWeek(date, today, { weekStartsOn: 1 })) {
    return 'สัปดาห์นี้';
  } else if (isSameMonth(date, today)) {
    return 'เดือนนี้';
  } else {
    return format(date, 'MMMM yyyy');
  }
};