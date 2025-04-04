'use client';

import * as React from 'react';
import { Search, Filter, ChevronDown, XCircle, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type FilterType = {
  type: 'all' | 'income' | 'expense';
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortOption: 'newest' | 'oldest' | 'highest' | 'lowest';
  searchTerm: string;
};

interface TransactionFiltersProps {
  filters: FilterType;
  updateFilter: (key: keyof FilterType, value: string) => void;
  resetFilters: () => void;
  uniqueCategories: string[];
  activeFilterCount?: number;
}

export function TransactionFilters({
  filters,
  updateFilter,
  resetFilters,
  uniqueCategories,
  activeFilterCount = 0,
}: TransactionFiltersProps) {
  const [showAllFilters, setShowAllFilters] = React.useState(false);
  const [isMobileView, setIsMobileView] = React.useState(false);
  
  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Determine which filters to show inline vs in popover
  const showInlineFilters = !isMobileView || showAllFilters;
  
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center gap-2 w-full">
        {/* Always visible search input */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหารายการ..."
            className="pl-9 w-full"
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
          {filters.searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateFilter('searchTerm', '')}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full hover:bg-muted"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Mobile filter button that opens popover */}
        {isMobileView && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>ตัวกรอง</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">ตัวกรองขั้นสูง</h4>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">ประเภทรายการ</p>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => updateFilter('type', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="income">รายรับ</SelectItem>
                        <SelectItem value="expense">รายจ่าย</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">หมวดหมู่</p>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => updateFilter('category', value)}
                    >
                      <SelectTrigger className="w-full">
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
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">ช่วงเวลา</p>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => updateFilter('dateRange', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ช่วงเวลา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="today">วันนี้</SelectItem>
                        <SelectItem value="week">สัปดาห์นี้</SelectItem>
                        <SelectItem value="month">เดือนนี้</SelectItem>
                        <SelectItem value="year">ปีนี้</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">การเรียงลำดับ</p>
                    <Select
                      value={filters.sortOption}
                      onValueChange={(value) => updateFilter('sortOption', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เรียงลำดับ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                        <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                        <SelectItem value="highest">ยอดสูงสุดก่อน</SelectItem>
                        <SelectItem value="lowest">ยอดต่ำสุดก่อน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      รีเซ็ตตัวกรอง
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => document.body.click()} // Close popover
                    >
                      ใช้ตัวกรอง
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={resetFilters}
                    disabled={activeFilterCount === 0}
                    className="h-9 w-9"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>รีเซ็ตตัวกรอง</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* Desktop filters that show inline */}
        {!isMobileView && (
          <div className="flex flex-wrap items-center gap-2">
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
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="ช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
                <SelectItem value="year">ปีนี้</SelectItem>
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              className="gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              รีเซ็ต
            </Button>
          </div>
        )}
      </div>
      
      {/* Active filters */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-1.5 overflow-hidden"
          >
            {filters.type !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 px-2.5 py-1"
              >
                <span>ประเภท: {filters.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</span>
                <XCircle 
                  className="h-3 w-3 cursor-pointer hover:text-primary" 
                  onClick={() => updateFilter('type', 'all')}
                />
              </Badge>
            )}
            
            {filters.category !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 px-2.5 py-1"
              >
                <span>หมวดหมู่: {filters.category}</span>
                <XCircle 
                  className="h-3 w-3 cursor-pointer hover:text-primary" 
                  onClick={() => updateFilter('category', 'all')}
                />
              </Badge>
            )}
            
            {filters.dateRange !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 px-2.5 py-1"
              >
                <span>ช่วงเวลา: {
                  filters.dateRange === 'today' ? 'วันนี้' :
                  filters.dateRange === 'week' ? 'สัปดาห์นี้' :
                  filters.dateRange === 'month' ? 'เดือนนี้' : 'ปีนี้'
                }</span>
                <XCircle 
                  className="h-3 w-3 cursor-pointer hover:text-primary" 
                  onClick={() => updateFilter('dateRange', 'all')}
                />
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}