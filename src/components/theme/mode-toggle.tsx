'use client';

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: typeof Sun;
  description: string;
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Theme options configuration
  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "สว่าง",
      icon: Sun,
      description: "ใช้ธีมสว่างสำหรับการใช้งานในพื้นที่มีแสง",
    },
    {
      value: "dark",
      label: "มืด",
      icon: Moon,
      description: "ใช้ธีมมืดเพื่อลดแสงจอและถนอมสายตา",
    },
    {
      value: "system",
      label: "ระบบ",
      icon: Monitor,
      description: "ปรับตามการตั้งค่าของระบบ",
    },
  ];

  // Get current display theme (accounting for system preference)
  const getCurrentDisplayTheme = (): "light" | "dark" => {
    if (!mounted) return "light";
    
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    return theme === "dark" ? "dark" : "light";
  };

  const displayTheme = getCurrentDisplayTheme();
  const ThemeIcon = themeOptions.find(t => t.value === (theme === "system" ? displayTheme : theme))?.icon || Sun;

  // Initialize theme on component mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document and save preference
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const applyTheme = () => {
      const resolvedTheme = theme === "system" 
        ? (mediaQuery.matches ? "dark" : "light") 
        : theme;
        
      if (resolvedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    // Listen for system preference changes
    const handleChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  // Update theme and close dropdown
  const setThemeHandler = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    // Render empty div with same dimensions to prevent layout shift
    return <div className="w-9 h-9" />;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative rounded-full w-9 h-9 overflow-hidden transition-all",
                  isHovered && "bg-primary/10"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={`เปลี่ยนธีม (ปัจจุบัน: ${theme === "system" ? "ระบบ" : theme === "dark" ? "มืด" : "สว่าง"})`}
              >
                {/* Background glow effect */}
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300",
                  displayTheme === "dark" ? "bg-blue-500/10" : "bg-amber-500/10",
                  isHovered && "opacity-30"
                )} />
                
                {/* Icon container with animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayTheme}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <ThemeIcon className={cn(
                      "h-5 w-5",
                      displayTheme === "dark" ? "text-blue-200" : "text-amber-500"
                    )} />
                  </motion.div>
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent side="bottom" className="font-medium">
            <p>เปลี่ยนธีม</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <div className="flex flex-col gap-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setThemeHandler(option.value)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
                    option.value === "dark" && "bg-blue-950/10",
                    option.value === "light" && "bg-amber-100",
                    option.value === "system" && "bg-slate-100 dark:bg-slate-800",
                    isActive && option.value === "dark" && "bg-blue-100 text-blue-900",
                    isActive && option.value === "light" && "bg-amber-100 text-amber-900",
                    isActive && option.value === "system" && "bg-primary/20 text-primary"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  
                  {isActive && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default ThemeToggle;