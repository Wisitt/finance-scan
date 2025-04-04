import { format, Locale, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerInputProps = {
  value: string | null;
  onChange: (val: string) => void;
  dateFormat?: string;
  locale?: Locale;
};

export function DatePickerInput({
  value,
  onChange,
  dateFormat = 'dd/MM/yyyy',
  locale = th,
}: DatePickerInputProps) {
  let date: Date | null = null;

  try {
    if (value) {
      const parsed = parseISO(value);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
  } catch (e) {
    date = null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date instanceof Date && !isNaN(date.getTime()) ? (
            format(date, dateFormat, { locale })
          ) : (
            <span>เลือกวันที่</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate.toISOString().split('T')[0]);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
