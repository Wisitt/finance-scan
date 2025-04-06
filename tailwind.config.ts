import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          light: "hsl(var(--border-light))",
          dark: "hsl(var(--border-dark))",
        },
        input: {
          DEFAULT: "hsl(var(--input))",
          light: "hsl(var(--input-light))",
          dark: "hsl(var(--input-dark))",
        },
        ring: {
          DEFAULT: "hsl(var(--ring))",
          light: "hsl(var(--ring-light))",
          dark: "hsl(var(--ring-dark))",
        },
        background: {
          DEFAULT: "hsl(var(--background))",
          alt: "hsl(var(--background-alt))",
          hover: "hsl(var(--background-hover))",
          alpha: {
            '0': "hsl(var(--background-alpha-0))",
            '10': "hsl(var(--background-alpha-10))",
          },
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          alt: "hsl(var(--foreground-alt))",
          muted: "hsl(var(--foreground-muted))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
          hover: "hsl(var(--primary-hover))",
          focus: "hsl(var(--primary-focus))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "hsl(var(--secondary-light))",
          dark: "hsl(var(--secondary-dark))",
          hover: "hsl(var(--secondary-hover))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          hover: "hsl(var(--destructive-hover))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          hover: "hsl(var(--success-hover))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          hover: "hsl(var(--warning-hover))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          hover: "hsl(var(--info-hover))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          background: "hsl(var(--muted-background))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "hsl(var(--accent-light))",
          dark: "hsl(var(--accent-dark))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
          border: "hsl(var(--popover-border))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          hover: "hsl(var(--card-hover))",
          border: "hsl(var(--card-border))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom color scales
        slate: {
          50: "hsl(var(--slate-50))",
          100: "hsl(var(--slate-100))",
          200: "hsl(var(--slate-200))",
          300: "hsl(var(--slate-300))",
          400: "hsl(var(--slate-400))",
          500: "hsl(var(--slate-500))",
          600: "hsl(var(--slate-600))",
          700: "hsl(var(--slate-700))",
          800: "hsl(var(--slate-800))",
          900: "hsl(var(--slate-900))",
          950: "hsl(var(--slate-950))",
        },
        violet: {
          50: "hsl(var(--violet-50))",
          100: "hsl(var(--violet-100))",
          200: "hsl(var(--violet-200))",
          300: "hsl(var(--violet-300))",
          400: "hsl(var(--violet-400))",
          500: "hsl(var(--violet-500))",
          600: "hsl(var(--violet-600))",
          700: "hsl(var(--violet-700))",
          800: "hsl(var(--violet-800))",
          900: "hsl(var(--violet-900))",
          950: "hsl(var(--violet-950))",
        },
        sky: {
          50: "hsl(var(--sky-50))",
          100: "hsl(var(--sky-100))",
          200: "hsl(var(--sky-200))",
          300: "hsl(var(--sky-300))",
          400: "hsl(var(--sky-400))",
          500: "hsl(var(--sky-500))",
          600: "hsl(var(--sky-600))",
          700: "hsl(var(--sky-700))",
          800: "hsl(var(--sky-800))",
          900: "hsl(var(--sky-900))",
          950: "hsl(var(--sky-950))",
        },
        navy: {
          50: "hsl(var(--navy-50))",
          100: "hsl(var(--navy-100))",
          200: "hsl(var(--navy-200))",
          300: "hsl(var(--navy-300))",
          400: "hsl(var(--navy-400))",
          500: "hsl(var(--navy-500))",
          600: "hsl(var(--navy-600))",
          700: "hsl(var(--navy-700))",
          800: "hsl(var(--navy-800))",
          900: "hsl(var(--navy-900))",
          950: "hsl(var(--navy-950))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xs: "var(--radius-xs)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "9999px",
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" }
        },
        "slide-in-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" }
        },
        "slide-out-top": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" }
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" }
        },
        "slide-out-bottom": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" }
        },
        "subtle-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.03)", opacity: "0.8" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "spinner-dash": {
          "0%": { "stroke-dasharray": "1, 150", "stroke-dashoffset": "0" },
          "50%": { "stroke-dasharray": "90, 150", "stroke-dashoffset": "-35" },
          "100%": { "stroke-dasharray": "90, 150", "stroke-dashoffset": "-124" }
        },
        "spinner-rotate": {
          "100%": { transform: "rotate(360deg)" }
        },
        "theme-toggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-15deg)" },
          "75%": { transform: "rotate(15deg)" },
        },
        glow: {
          "0%, 100%": { 
            boxShadow: "0 0 8px rgba(124, 58, 237, 0.6)"
          },
          "50%": { 
            boxShadow: "0 0 12px rgba(124, 58, 237, 0.8)"
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0"
          },
          "100%": {
            backgroundPosition: "200% 0"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scale-out": "scale-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.3s ease-out",
        "slide-in-top": "slide-in-top 0.3s ease-out",
        "slide-out-top": "slide-out-top 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "slide-out-bottom": "slide-out-bottom 0.3s ease-out",
        "subtle-pulse": "subtle-pulse 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "spinner-dash": "spinner-dash 1.5s ease-in-out infinite",
        "spinner-rotate": "spinner-rotate 2s linear infinite",
        "theme-toggle": "theme-toggle 1s ease-in-out",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite"
      },
      fontSize: {
        "2xs": "0.625rem", // 10px
        xs: "0.75rem",     // 12px
        sm: "0.875rem",    // 14px
        md: "1rem",        // 16px
        lg: "1.125rem",    // 18px
        xl: "1.25rem",     // 20px
        "2xl": "1.5rem",   // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem",  // 36px
        "5xl": "3rem",     // 48px
        "6xl": "3.75rem",  // 60px
        "7xl": "4.5rem",   // 72px
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionProperty: {
        'theme': 'color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(to right, hsl(var(--background-alpha-0)), var(--shine-highlight), hsl(var(--background-alpha-0)))',
        'violet-gradient': 'linear-gradient(135deg, hsl(var(--violet-400)), hsl(var(--violet-600)))',
        'sky-gradient': 'linear-gradient(135deg, hsl(var(--sky-400)), hsl(var(--sky-600)))',
        'navy-gradient': 'linear-gradient(135deg, hsl(var(--navy-700)), hsl(var(--navy-900)))'
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;