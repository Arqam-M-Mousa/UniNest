import { createContext, useContext, useEffect, useState, useRef } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const userOverrideRef = useRef(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    }
    return "light";
  });

  // Apply theme classes to both <html> and <body> for extra robustness.
  // This helps if custom CSS targets body.dark and ensures Tailwind "dark" variants still work (html has class).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      html.classList.add("dark");
      body.classList.add("dark");
    } else {
      html.classList.remove("dark");
      body.classList.remove("dark");
    }
    html.style.colorScheme = theme;
    html.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!userOverrideRef.current) setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    userOverrideRef.current = true;
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
