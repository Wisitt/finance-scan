'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/constants/routes';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CreditCard,
  LogIn,
  ScanLine,
  TrendingUp,
  ChevronRight,
  BellRing,
  Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/theme/mode-toggle';
import { DashboardCard } from '@/components/ui/theme-card';
import { FeatureCard } from '@/components/ui/feature-card';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [scrollPosition, setScrollPosition] = useState(0);
  const isDark = theme === 'dark';

  // Memoized time and greeting - computed once on mount
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

  // Optimized scroll handler using useCallback
  const handleScroll = useCallback(() => {
    setScrollPosition(window.scrollY);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    // Add passive option for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(APP_ROUTES.DASHBOARD);
    }
  }, [session, status, router]);

  // Memoized sign in handler
  const handleSignIn = useCallback(() => {
    signIn('google', { callbackUrl: APP_ROUTES.DASHBOARD });
  }, []);

  // Memoized navigation opacity calculation
  const navOpacity = useMemo(() => {
    return Math.min(scrollPosition / 300, 1);
  }, [scrollPosition]);

  // Optimized loading state with memoization
  const loadingView = useMemo(() => (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-gradient-radial from-background to-background/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Spinner container */}
      <motion.div
        className="relative w-20 h-20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Soft glowing backdrop */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse" />
        {/* Spinner ring */}
        <div className="absolute inset-2 rounded-full border-t-[2px] border-primary" />
        {/* Center icon with bounce */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 0.8, 1] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <TrendingUp className="h-8 w-8 text-primary" />
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
      className="fixed top-0 left-0 right-0 z-50 py-4 backdrop-blur-md"
      style={{
        backgroundColor: isDark
          ? `rgba(0, 0, 0, ${navOpacity * 0.8})`
          : `rgba(255, 255, 255, ${navOpacity * 0.8})`,
        boxShadow: scrollPosition > 50 ? `0 4px 20px hsl(var(--primary)/20%)` : 'none',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-wide">
            FinTrack
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          <span className="text-sm text-muted-foreground hidden md:inline-block mr-3">
            {currentTime} • {greeting}
          </span>

          <Badge
            variant="outline"
            className="hidden md:flex items-center gap-1 border-none text-xs transition-colors bg-primary/10"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium text-[0.7rem]">New</span>
          </Badge>

          {status !== 'authenticated' ? (
            <Button
              variant="ghost"
              className="flex items-center gap-2 transition hover:opacity-90 bg-primary/10"
              onClick={handleSignIn}
            >
              <span>เข้าสู่ระบบ</span>
              <LogIn className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 text-primary-foreground bg-primary"
              onClick={() => router.push(APP_ROUTES.DASHBOARD)}
            >
              <span>แดชบอร์ด</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  ), [navOpacity, scrollPosition, isDark, currentTime, greeting, status, handleSignIn, router]);

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
                <Badge className="border-none text-xs bg-primary/30 text-primary">
                  2025
                </Badge>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                <span className="block">จัดการการเงิน</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
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
                    className="text-primary-foreground px-8 rounded-xl h-14 text-lg font-semibold shadow-lg w-full sm:w-auto bg-primary hover:bg-primary/90"
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
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 bg-gradient-to-r from-primary/30 to-primary/20"></div>

              {/* Card inner content */}
              <div className="relative z-10">
                <DashboardCard />
              </div>
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
            <FeatureCard
              icon={<ScanLine className="h-8 w-8" />}
              title="สแกนใบเสร็จอัจฉริยะ"
              description="เพียงถ่ายรูปใบเสร็จ AI จะวิเคราะห์และบันทึกค่าใช้จ่ายให้คุณโดยอัตโนมัติ พร้อมจำแนกหมวดหมู่อย่างแม่นยำ"
              index={0}
            />

            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="วิเคราะห์การใช้จ่าย"
              description="ดูรายงานและกราฟวิเคราะห์แบบเรียลไทม์ พร้อมข้อเสนอแนะส่วนตัวในการวางแผนการเงินที่เหมาะกับไลฟ์สไตล์ของคุณ"
              index={1}
            />

            <FeatureCard
              icon={<CreditCard className="h-8 w-8" />}
              title="จัดการธุรกรรมแบบง่าย"
              description="บันทึกรายรับรายจ่าย จัดหมวดหมู่ และติดตามยอดคงเหลือได้อย่างง่ายดาย พร้อมระบบแจ้งเตือนค่าใช้จ่ายที่ผิดปกติ"
              index={2}
            />
          </div>
        </section>
      </main>

      {/* Footer with improved theming */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-wide">
                FinTrack
              </span>
            </div>

            {/* <div className="flex gap-6">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                เกี่ยวกับเรา
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                ฟีเจอร์
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                ราคา
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-primary/10">
                ติดต่อ
              </Button>
            </div> */}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 FinTrack — แพลตฟอร์มจัดการการเงินส่วนบุคคล
            </p>

            {/* <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793 3.286 3.286 0 0 0-2.397-1.034c-1.817 0-3.287 1.47-3.287 3.286 0 .258.03.51.087.75A9.325 9.325 0 0 1 1.114 2.1a3.286 3.286 0 0 0 1.02 4.379 3.203 3.203 0 0 1-1.487-.41v.041c0 1.538 1.096 2.826 2.548 3.118a3.203 3.203 0 0 1-.864.115c-.211 0-.417-.02-.618-.06a3.286 3.286 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a9.321 9.321 0 0 0 5.026 1.47" />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                </svg>
              </Button>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
}