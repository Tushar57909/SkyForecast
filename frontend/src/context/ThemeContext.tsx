import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Primary light sky blue atmospheric theme
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('aeris-theme') as Theme | null;
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('aeris-theme', theme);
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
