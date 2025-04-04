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
  iconClass: string;
  bgClass: string;
  activeBgClass: string;
  activeTextClass: string;
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced theme options configuration
  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "สว่าง",
      icon: Sun,
      description: "ใช้ธีมสว่างสำหรับการใช้งานในพื้นที่มีแสง",
      iconClass: "text-amber-500",
      bgClass: "bg-gradient-to-br from-amber-50 to-amber-100",
      activeBgClass: "bg-gradient-to-br from-amber-100 to-amber-200",
      activeTextClass: "text-amber-600",
    },
    {
      value: "dark",
      icon: Moon,
      label: "มืด",
      description: "ใช้ธีมมืดเพื่อลดแสงจอและถนอมสายตา",
      iconClass: "text-violet-400",
      bgClass: "bg-gradient-to-br from-violet-400/20 to-indigo-400/20",
      activeBgClass: "bg-gradient-to-br from-violet-400/30 to-indigo-400/30",
      activeTextClass: "text-violet-300",
    },
    {
      value: "system",
      icon: Monitor,
      label: "ระบบ",
      description: "ปรับตามการตั้งค่าของระบบ",
      iconClass: "text-sky-500",
      bgClass: "bg-slate-100 dark:bg-slate-800/40",
      activeBgClass: "bg-gradient-to-br from-sky-400/20 to-sky-500/20",
      activeTextClass: "text-sky-400",
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
  const currentThemeOption = themeOptions.find(t => t.value === (theme === "system" ? displayTheme : theme)) 
    || themeOptions.find(t => t.value === theme) 
    || themeOptions[0];
  
  const ThemeIcon = currentThemeOption.icon;
  const iconClass = currentThemeOption.iconClass;

  // Initialize theme on component mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document and save preference with enhanced transitions
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const applyTheme = () => {
      const resolvedTheme = theme === "system" 
        ? (mediaQuery.matches ? "dark" : "light") 
        : theme;
        
      const root = document.documentElement;
      
      // Add theme transition class for smooth changes
      if (!root.classList.contains('theme-transition')) {
        root.classList.add('theme-transition');
      }
      
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
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

  // Update theme
  const setThemeHandler = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    // Render empty div with same dimensions to prevent layout shift
    return <div className="w-10 h-10" />;
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
                  "relative rounded-full w-10 h-10 overflow-hidden transition-all border",
                  isHovered && displayTheme === "dark" 
                    ? "bg-violet-500/10 border-violet-500/30" 
                    : isHovered 
                    ? "bg-amber-500/10 border-amber-500/30" 
                    : "border-transparent"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={`เปลี่ยนธีม (ปัจจุบัน: ${theme === "system" ? "ระบบ" : theme === "dark" ? "มืด" : "สว่าง"})`}
              >
                {/* Enhanced background effect */}
                <div className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-300",
                  displayTheme === "dark" 
                    ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20" 
                    : "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
                  isHovered && "opacity-40"
                )} />
                
                {/* Icon container with enhanced animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayTheme + theme}
                    initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
                    transition={{ duration: 0.25, type: "spring", stiffness: 200 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <ThemeIcon className={cn("h-5 w-5", iconClass)} />
                  </motion.div>
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent side="bottom" className="font-medium">
            <div>เปลี่ยนธีม</div>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <div className="flex flex-col gap-1.5">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setThemeHandler(option.value)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all",
                    isActive 
                      ? option.value === "dark" 
                        ? "bg-violet-500/20 dark:bg-violet-500/20" 
                        : option.value === "light" 
                        ? "bg-amber-500/20" 
                        : "bg-sky-500/20"
                      : "hover:bg-background-hover"
                  )}
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
                      option.bgClass,
                      isActive && option.activeBgClass
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5", 
                      option.iconClass,
                      isActive && option.activeTextClass
                    )} />
                  </motion.div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        option.value === "dark" ? "bg-violet-500 text-navy-900" :
                        option.value === "light" ? "bg-amber-500 text-white" :
                        "bg-sky-500 text-white"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
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