import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type FilterType = {
  type: 'all' | 'income' | 'expense';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortOption: 'newest' | 'oldest' | 'highest' | 'lowest';
  searchTerm: string;
  
};

interface TransactionFiltersProps {
  filters: FilterType;
  updateFilter: (key: keyof FilterType, value: string) => void;
  resetFilters: () => void;
  uniqueCategories: string[];
}

export default function TransactionFilters({
  filters,
  updateFilter,
  resetFilters,
  uniqueCategories,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหารายการ..."
          className="pl-8 w-full sm:w-40"
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.type}
          onValueChange={(value) => updateFilter('type', value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="ประเภท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="income">รายรับ</SelectItem>
            <SelectItem value="expense">รายจ่าย</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilter('category', value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="หมวดหมู่" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat || 'uncategorized'}>
                {cat === 'all' ? 'ทั้งหมด' : (cat || 'ไม่มีหมวดหมู่')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.dateRange}
          onValueChange={(value) => updateFilter('dateRange', value)}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="ช่วงเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="today">วันนี้</SelectItem>
            <SelectItem value="week">สัปดาห์นี้</SelectItem>
            <SelectItem value="month">เดือนนี้</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.sortOption}
          onValueChange={(value) => updateFilter('sortOption', value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="เรียงลำดับ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
            <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
            <SelectItem value="highest">ยอดสูงสุดก่อน</SelectItem>
            <SelectItem value="lowest">ยอดต่ำสุดก่อน</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          รีเซ็ต
        </Button>
      </div>
    </div>
  );
}