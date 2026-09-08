import { useEffect, useState } from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const LANGUAGES = ["English", "हिन्दी", "Español", "Français", "Deutsch", "中文"];

const PreferencesBar = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("pref-theme") as "light" | "dark") || "light";
  });
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pref-theme", theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* Theme toggle */}
      <div className="flex items-center gap-1.5">
        <span className="hidden sm:inline font-medium text-foreground">
          {theme === "light" ? "Light Mode" : "Dark Mode"}
        </span>
        <button
          onClick={() => setTheme("light")}
          aria-label="Light mode"
          className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
            theme === "light" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          aria-label="Dark mode"
          className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
            theme === "dark" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="h-5 w-px bg-border" />

      {/* Language */}
      <div className="relative flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          aria-label="Select language"
          className="bg-transparent text-foreground focus:outline-none text-xs pr-1"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PreferencesBar;
