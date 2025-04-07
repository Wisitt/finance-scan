'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/constants/routes';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  LogIn,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/theme/mode-toggle';
import { DashboardCard } from '@/components/ui/theme-card';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [scrollPosition, setScrollPosition] = useState(0);
  const isDark = theme === 'dark';


  const { currentTime, greeting } = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const formattedTime = now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let greeting = '';
    if (hours < 12) greeting = 'สวัสดีตอนเช้า';
    else if (hours < 17) greeting = 'สวัสดีตอนบ่าย';
    else greeting = 'สวัสดีตอนเย็น';

    return { currentTime: formattedTime, greeting };
  }, []);


  const handleScroll = useCallback(() => {
    setScrollPosition(window.scrollY);
  }, []);


  useEffect(() => {

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(APP_ROUTES.DASHBOARD);
    }
  }, [session, status, router]);


  const handleSignIn = useCallback(() => {
    signIn('google', { callbackUrl: APP_ROUTES.DASHBOARD });
  }, []);


  const loadingView = useMemo(() => (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Eye-inspired loader */}
      <motion.div
        className="relative w-24 h-24"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer eye shape */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        {/* Iris ring */}
        <div className="absolute inset-1 rounded-full border-2 border-primary/80" />
        
        {/* Animated iris */}
        <motion.div 
          className="absolute inset-3 rounded-full bg-gradient-to-r from-primary to-accent"
          animate={{
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Pupil with dollar sign */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 0.95, 1],
            rotate: [0, 5, 0, -5, 0] 
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="bg-foreground rounded-full w-6 h-6 flex items-center justify-center">
            <span className="text-background font-bold text-sm">$</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Loading text that subtly fades in/out */}
      <motion.p
        className="ml-6 text-muted-foreground font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        กำลังเตรียมข้อมูลให้คุณ...
      </motion.p>
    </motion.div>
  ), []);

  // Optimized header component 
  const headerComponent = useMemo(() => (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 py-4"
      style={{
        backgroundColor: isDark
          ? `rgb(0, 0, 0)` // Pure black in dark mode with no opacity
          : `rgb(255, 255, 255)`, // Pure white in light mode with no opacity
        boxShadow: scrollPosition > 50 && isDark 
          ? `0 1px 0 rgb(30, 30, 30)` // Very subtle border in dark mode
          : scrollPosition > 50 && !isDark 
          ? '0 1px 0 rgb(240, 240, 240)' // Very subtle border in light mode
          : 'none',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto flex justify-between items-center px-4 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* Logo container - clean design without shadows */}
            <motion.div
              className={cn(
                "relative bg-gradient-to-br from-primary via-[#4caf50]/80 to-accent/80 rounded-full", 
                "w-full h-full flex items-center justify-center overflow-hidden",
                isDark ? "border border-[#333333]" : "border border-[#f0f0f0]"
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {/* Eye-shaped logo with dollar sign */}
              <div className={cn(
                "absolute inset-1 rounded-full flex items-center justify-center",
                isDark ? "bg-black" : "bg-white"
              )}>
                <div className="relative w-5 h-5 rounded-full bg-gradient-to-r from-primary to-[#4caf50] flex items-center justify-center">
                  <span className={cn(
                    "font-bold text-xs",
                    isDark ? "text-black" : "text-white"
                  )}>$</span>
                  {/* Animated scanning line */}
                  <motion.div 
                    className={cn(
                      "absolute inset-0 h-[1px] w-full",
                      isDark ? "bg-black" : "bg-white"
                    )}
                    animate={{ 
                      top: ["20%", "80%", "20%"],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
  
          <h1 className="text-lg font-bold">
            Fin<span className="text-accent">$</span>ight
            <span className="relative ml-1">
              <motion.span 
                className="absolute -top-1 -right-2 text-[#4caf50] text-xs"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                ⟡
              </motion.span>
            </span>
          </h1>
        </div>
  
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
  
          <span className="text-sm text-muted-foreground hidden md:inline-block mr-3">
            {currentTime} • {greeting}
          </span>
  
          <Badge
            variant="outline"
            className={cn(
              "hidden md:flex items-center gap-1 border-none text-xs transition-colors",
              isDark ? "bg-[#222222]" : "bg-[#f8f8f8]"
            )}
          >
            <Sparkles className="h-3 w-3 text-[#4caf50]" />
            <span className="font-medium text-[0.7rem]">New</span>
          </Badge>
  
          {status !== 'authenticated' ? (
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-2 transition hover:opacity-90",
                isDark ? "bg-[#222222]" : "bg-[#f8f8f8]"
              )}
              onClick={handleSignIn}
            >
              <span>เข้าสู่ระบบ</span>
              <LogIn className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 text-primary-foreground bg-gradient-to-r from-primary to-[#4caf50]"
              onClick={() => router.push(APP_ROUTES.DASHBOARD)}
            >
              <span>แดชบอร์ด</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  ), [scrollPosition, isDark, currentTime, greeting, status, handleSignIn, router]);

  if (status === "loading") {
    return loadingView;
  }

  return (
    <div className="min-h-screen text-foreground bg-background">
      {/* Floating navigation */}
      {headerComponent}

      <main className="container mx-auto pt-36 pb-20 px-4">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto mb-32">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6 },
                },
              }}
            >
              {/* Badge at top of Hero */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-primary/20">
                <span className="font-medium text-sm text-primary">
                  วางแผนการเงินอย่างชาญฉลาด
                </span>
                <Badge className="border-none text-xs bg-accent/30 text-accent-foreground">
                  2025
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                <span className="block">จัดการการเงิน</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#30c5d2] to-accent">
                  เหนือระดับ
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                ระบบจัดการการเงินส่วนบุคคลด้วยเทคโนโลยี AI ที่จะช่วยให้คุณวางแผนการเงิน
                ติดตามค่าใช้จ่าย และสร้างความมั่งคั่งอย่างยั่งยืน
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={handleSignIn}
                    className="text-primary-foreground px-8 rounded-xl h-14 text-lg font-semibold shadow-lg w-full sm:w-auto bg-gradient-to-r from-primary to-[#30c5d2] hover:from-primary/90 hover:to-[#30c5d2]/90"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    เริ่มต้นใช้งานฟรี
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl h-14 text-lg font-semibold border-2 border-primary/60 text-primary w-full sm:w-auto transition"
                  >
                    ทดลองใช้งาน
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.8 },
                },
              }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 bg-gradient-to-r from-primary/30 to-accent/20"></div>

              {/* Financial vision eye decoration */}
              <div className="absolute -top-12 -right-12 w-24 h-24 opacity-20 pointer-events-none">
                <div className="relative w-full h-full">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-primary"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                  <motion.div 
                    className="absolute inset-4 rounded-full border-2 border-accent"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                  <motion.div
                    className="absolute inset-8 rounded-full bg-gradient-to-r from-primary to-accent"
                    animate={{ scale: [1, 0.8, 1] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                </div>
              </div>

              {/* Card inner content */}
              <div className="relative z-10">
                <DashboardCard />
              </div>

              {/* Growth indicator */}
              <motion.div 
                className="absolute -bottom-8 -left-8 w-20 h-20 opacity-80 pointer-events-none"
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <motion.path
                    d="M10,70 Q30,30 50,50 T90,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-accent"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <motion.circle 
                    cx="90" 
                    cy="30" 
                    r="5" 
                    className="fill-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 2.5 }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto mb-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <Badge className="border-none mb-4 bg-primary/20 text-primary">
              คุณสมบัติหลัก
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              จัดการการเงินของคุณได้อย่างง่ายดาย
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ด้วยฟีเจอร์ที่ครบครัน ช่วยให้คุณจัดการทุกด้านของการเงินส่วนบุคคลได้อย่างมีประสิทธิภาพ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Eye-themed scan card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-border p-6 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform origin-left transition-transform duration-300 group-hover:scale-x-100" />
              
              {/* Eye-themed icon with scan line animation */}
              <div className="relative w-14 h-14 rounded-full mb-4 bg-primary/10 flex items-center justify-center overflow-hidden">
                <div className="relative w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  {/* Scan line animation */}
                  <motion.div 
                    className="absolute h-[2px] w-full bg-accent" 
                    animate={{ 
                      top: ["30%", "70%", "30%"],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut", 
                      repeat: Infinity 
                    }}
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                สแกนใบเสร็จอัจฉริยะ
              </h3>
              <p className="text-muted-foreground">
                เพียงถ่ายรูปใบเสร็จ AI จะวิเคราะห์และบันทึกค่าใช้จ่ายให้คุณโดยอัตโนมัติ พร้อมจำแนกหมวดหมู่อย่างแม่นยำ
              </p>
            </motion.div>

            {/* Chart-themed analysis card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-border p-6 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary transform origin-left transition-transform duration-300 group-hover:scale-x-100" />
              
              {/* Chart-themed icon */}
              <div className="relative w-14 h-14 rounded-full mb-4 bg-primary/10 flex items-center justify-center">
                <div className="w-10 h-10 flex items-end justify-center gap-[3px]">
                  {[0.3, 0.5, 0.7, 0.6, 0.8].map((height, i) => (
                    <motion.div 
                      key={i}
                      className="w-1 bg-gradient-to-t from-primary to-accent rounded-t-sm"
                      style={{ height: `${height * 100}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 3,
                        repeatType: "reverse"
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                วิเคราะห์การใช้จ่าย
              </h3>
              <p className="text-muted-foreground">
                ดูรายงานและกราฟวิเคราะห์แบบเรียลไทม์ พร้อมข้อเสนอแนะส่วนตัวในการวางแผนการเงินที่เหมาะกับไลฟ์สไตล์ของคุณ
              </p>
            </motion.div>

            {/* Card with dollar sign */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-border p-6 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary transform origin-left transition-transform duration-300 group-hover:scale-x-100" />
              
              {/* Card with dollar sign animation */}
              <div className="relative w-14 h-14 rounded-full mb-4 bg-primary/10 flex items-center justify-center overflow-hidden">
                <motion.div
                  className="w-10 h-6 rounded bg-gradient-to-r from-primary to-accent flex items-center justify-center"
                  animate={{ y: [0, -2, 0], rotate: [0, 2, 0, -2, 0] }}
                  transition={{ 
                    duration: 4, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                >
                  <span className="text-card font-bold">$</span>
                </motion.div>
                <motion.div 
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-[1px] bg-accent/70 rounded"
                  animate={{ width: ["50%", "70%", "50%"] }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeInOut", 
                    repeat: Infinity 
                  }}
                />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                จัดการธุรกรรมแบบง่าย
              </h3>
              <p className="text-muted-foreground">
                บันทึกรายรับรายจ่าย จัดหมวดหมู่ และติดตามยอดคงเหลือได้อย่างง่ายดาย พร้อมระบบแจ้งเตือนค่าใช้จ่ายที่ผิดปกติ
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer with improved theming */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="relative w-12 h-12">
                {/* Logo glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-md"></div>
                
                {/* Logo container */}
                <motion.div
                  className="relative bg-gradient-to-br from-primary to-accent/80 rounded-full shadow-lg shadow-primary/20 border border-primary/10 w-full h-full flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {/* Eye-shaped logo with dollar sign */}
                  <div className="absolute inset-2 rounded-full bg-background/90 flex items-center justify-center">
                    <div className="relative w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <span className="text-background font-bold text-sm">$</span>
                      {/* Animated scanning line */}
                      <motion.div 
                        className="absolute inset-0 bg-background/20 h-[1px] w-full" 
                        animate={{ 
                          top: ["20%", "80%", "20%"],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          ease: "easeInOut", 
                          repeat: Infinity 
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <h1 className="text-2xl font-bold">
                Fin<span className="text-accent">$</span>ight
              </h1>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 Fin$ight — แพลตฟอร์มจัดการการเงินด้วย AI และ OCR อัจฉริยะ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}