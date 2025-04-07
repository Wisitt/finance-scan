'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, ScanBarcode, Sun } from "lucide-react";
import { useEffect, useState } from "react";

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
  const { theme, setTheme, resolvedTheme } = useTheme(); // ✅ ใช้ context
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);

  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "สว่าง",
      icon: Eye,
      description: "ใช้ธีมสว่างสำหรับการมองเห็นที่คมชัด",
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      activeBgClass: "bg-primary/20",
      activeTextClass: "text-primary",
    },
    {
      value: "dark",
      icon: EyeOff,
      label: "มืด",
      description: "ใช้ธีมมืดเพื่อลดแสงจอและถนอมสายตา",
      iconClass: "text-accent",
      bgClass: "bg-accent/10",
      activeBgClass: "bg-accent/20",
      activeTextClass: "text-accent",
    },
    {
      value: "system",
      icon: ScanBarcode,
      label: "ระบบ",
      description: "ปรับตามการตั้งค่าของระบบ",
      iconClass: "text-secondary",
      bgClass: "bg-secondary/10",
      activeBgClass: "bg-secondary/20",
      activeTextClass: "text-secondary",
    },
  ];

  const currentThemeOption = themeOptions.find((t) => t.value === theme) || themeOptions[0];
  const ThemeIcon = currentThemeOption.icon;
  const iconClass = currentThemeOption.iconClass;
  const displayTheme = resolvedTheme;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScanningActive(true);
      const timer = setTimeout(() => setScanningActive(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const setThemeHandler = (newTheme: Theme) => {
    setTheme(newTheme);
    setScanningActive(true);
    setTimeout(() => setScanningActive(false), 1500);
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "relative rounded-full w-10 h-10 overflow-hidden transition-all border",
                  isHovered ? "bg-primary/10 border-primary/30" : "border-transparent"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={`เปลี่ยนธีม (ปัจจุบัน: ${theme})`}
              >
                {scanningActive && (
                  <motion.div
                    className="absolute left-0 right-0 h-[1px] pointer-events-none"
                    style={{
                      backgroundColor: displayTheme === "dark" ? 'var(--accent)' : 'var(--primary)',
                      opacity: 0.7,
                    }}
                    animate={{
                      top: ["30%", "70%", "30%"],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: scanningActive ? Infinity : 0,
                    }}
                  />
                )}

                <div
                  className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    isHovered && "opacity-40",
                    "bg-gradient-to-r from-primary/20 to-accent/20"
                  )}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayTheme + theme}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.25, type: "spring", stiffness: 200 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <ThemeIcon className={cn("h-5 w-5", iconClass)} />
                  </motion.div>
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="font-medium text-xs">
            <div>เปลี่ยนธีมการแสดงผล</div>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-56 p-1.5 border-border/50 relative">
          {scanningActive && (
            <motion.div
              className="absolute left-0 right-0 h-[1px] bg-primary/50 pointer-events-none"
              animate={{
                top: ["5%", "95%", "5%"],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: scanningActive ? 1 : 0,
              }}
            />
          )}

          <div className="flex flex-col gap-1.5">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;

              return (
                <motion.div
                  key={option.value}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <DropdownMenuItem
                    onClick={() => setThemeHandler(option.value)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all",
                      isActive
                        ? option.activeBgClass
                        : "hover:bg-muted/80"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all relative",
                        option.bgClass,
                        isActive && option.activeBgClass
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5",
                        option.iconClass,
                        isActive && option.activeTextClass
                      )} />

                      {isActive && (
                        <motion.div
                          className="absolute left-0 right-0 h-[1px]"
                          style={{
                            backgroundColor:
                              option.value === "dark" ? 'var(--accent)' :
                                option.value === "light" ? 'var(--primary)' :
                                  'var(--secondary)',
                            opacity: 0.7,
                          }}
                          animate={{
                            top: ["30%", "70%", "30%"],
                            opacity: [0.4, 0.7, 0.4],
                          }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        />
                      )}
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
                          option.value === "dark"
                            ? "bg-accent text-accent-foreground"
                            : option.value === "light"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <Eye className="h-3 w-3" />
                      </motion.div>
                    )}
                  </DropdownMenuItem>
                </motion.div>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default ThemeToggle;
