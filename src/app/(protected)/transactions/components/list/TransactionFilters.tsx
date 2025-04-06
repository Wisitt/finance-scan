'use client';

import * as React from 'react';
import { Search, Filter, XCircle, SlidersHorizontal, Eye } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [scanningActive, setScanningActive] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Activate scanning animation when filters change
  React.useEffect(() => {
    setScanningActive(true);
    const timer = setTimeout(() => setScanningActive(false), 2000);
    return () => clearTimeout(timer);
  }, [filters]);
  
  return (
    <div className="w-full space-y-3 relative">
      {/* Scanning line animation */}
      {scanningActive && (
        <motion.div 
          className="absolute left-0 right-0 h-[1px] bg-primary/30 pointer-events-none" 
          animate={{ 
            top: ["0%", "100%", "0%"],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: 2,
            ease: "linear",
          }}
        />
      )}
      
      <div className="flex flex-wrap items-center gap-2 w-full">
        <div className="relative flex-grow max-w-md">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <motion.div 
              animate={scanningActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Search className="h-4 w-4" />
            </motion.div>
          </div>
          <Input
            placeholder="ค้นหารายการ..."
            className="pl-9 w-full focus-visible:ring-primary/40 border-border/50"
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
          {filters.searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateFilter('searchTerm', '')}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full hover:bg-primary/5 hover:text-primary"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isMobileView && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1.5 border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>ตัวกรอง</span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-primary/10 text-primary">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 border-border/50">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-primary" />
                    ตัวกรองขั้นสูง
                  </h4>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">ประเภทรายการ</p>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => updateFilter('type', value)}
                    >
                      <SelectTrigger className="w-full border-border/50 focus:ring-primary/30">
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
                      <SelectTrigger className="w-full border-border/50 focus:ring-primary/30">
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
                      <SelectTrigger className="w-full border-border/50 focus:ring-primary/30">
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
                      <SelectTrigger className="w-full border-border/50 focus:ring-primary/30">
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetFilters}
                      className="border-border/50 hover:text-primary hover:border-primary/30"
                    >
                      รีเซ็ตตัวกรอง
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => document.body.click()}
                      className="bg-primary hover:bg-primary/90"
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
                    className="h-9 w-9 hover:bg-primary/5 hover:text-primary"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>รีเซ็ตตัวกรอง</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        

        {!isMobileView && (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.type}
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger className="w-[120px] border-border/50 focus:ring-primary/30">
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
              <SelectTrigger className="w-[120px] border-border/50 focus:ring-primary/30">
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
              <SelectTrigger className="w-[120px] border-border/50 focus:ring-primary/30">
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
              <SelectTrigger className="w-[130px] border-border/50 focus:ring-primary/30">
                <SelectValue placeholder="เรียงลำดับ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                <SelectItem value="highest">ยอดสูงสุดก่อน</SelectItem>
                <SelectItem value="lowest">ยอดต่ำสุดก่อน</SelectItem>
              </SelectContent>
            </Select>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="gap-1.5 border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              >
                <Filter className="h-3.5 w-3.5" />
                รีเซ็ต
              </Button>
            </motion.div>
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
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border-primary/20"
                >
                  <span>ประเภท: {filters.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</span>
                  <XCircle 
                    className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                    onClick={() => updateFilter('type', 'all')}
                  />
                </Badge>
              </motion.div>
            )}
            
            {filters.category !== 'all' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent border-accent/20"
                >
                  <span>หมวดหมู่: {filters.category}</span>
                  <XCircle 
                    className="h-3 w-3 cursor-pointer hover:text-accent/80" 
                    onClick={() => updateFilter('category', 'all')}
                  />
                </Badge>
              </motion.div>
            )}
            
            {filters.dateRange !== 'all' && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border-primary/20"
                >
                  <span>ช่วงเวลา: {
                    filters.dateRange === 'today' ? 'วันนี้' :
                    filters.dateRange === 'week' ? 'สัปดาห์นี้' :
                    filters.dateRange === 'month' ? 'เดือนนี้' : 'ปีนี้'
                  }</span>
                  <XCircle 
                    className="h-3 w-3 cursor-pointer hover:text-primary/80" 
                    onClick={() => updateFilter('dateRange', 'all')}
                  />
                </Badge>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}