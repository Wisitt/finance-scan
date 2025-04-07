'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
  systemTheme: 'dark' | 'light';
}

const initialState: ThemeContextType = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
  systemTheme: 'light',
};

const ThemeContext = createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme-preference',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get theme from localStorage if we're on the client
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(storageKey);
      if (storedTheme && (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system')) {
        return storedTheme;
      }
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  // Effect to handle system theme detection and changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Define what happens when system preference changes
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);

      if (theme === 'system') {
        setResolvedTheme(newSystemTheme);
        updateTheme(newSystemTheme);
      }
    };

    // Set initial values
    handleChange();

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Effect to update localStorage and apply theme class
  useEffect(() => {
    localStorage.setItem(storageKey, theme);

    const newResolvedTheme = theme === 'system' ? systemTheme : theme;
    setResolvedTheme(newResolvedTheme);
    updateTheme(newResolvedTheme);
  }, [theme, systemTheme, storageKey]);

  function updateTheme(resolvedTheme: 'dark' | 'light') {
    const root = window.document.documentElement;

    // Remove old class and add new one
    root.classList.remove('dark', 'light');
    root.classList.add(resolvedTheme);

    // Force a repaint to ensure theme changes are applied immediately
    const reflow = root.offsetHeight;

    // Add the transition class for smooth transitions
    // but only after initial load to prevent transition on page load
    const transitionClass = 'theme-transition';
    if (!root.classList.contains(transitionClass)) {
      // Wait a moment before adding the transition class
      // to avoid transition on initial page load
      setTimeout(() => {
        root.classList.add(transitionClass);
      }, 100);
    }
  }

  const value = {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};