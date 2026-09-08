import { useState } from "react";
import { Menu, X, Heart, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PreferencesBar from "./PreferencesBar";

const navItems = [
  { key: "home", href: "/", isRoute: true },
  { key: "services", href: "/#services" },
  { key: "reports", href: "/reports", isRoute: true },
  { key: "adminTitle", href: "/admin", isRoute: true },
  { key: "contact", href: "/contact", isRoute: true },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const renderItem = (item: typeof navItems[number], onClick?: () => void) => {
    const active = item.isRoute && pathname === item.href;
    const cls = `text-sm font-medium transition-colors hover:text-primary ${
      active ? "text-primary" : "text-muted-foreground"
    }`;
    const label = t(item.key);
    return item.isRoute ? (
      <Link to={item.href} onClick={onClick} className={cls}>{label}</Link>
    ) : (
      <a href={item.href} onClick={onClick} className={cls}>{label}</a>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900/80 shadow-sm dark:shadow-cyan-950/10">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-md shadow-cyan-400/20">
            <Heart className="h-5 w-5 text-white animate-pulse" />
          </span>
          <span className="text-slate-900 dark:text-white font-extrabold uppercase tracking-wide">
            AI Early <span className="text-cyan-500 font-bold">Detector</span>
          </span>
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.key}>{renderItem(item)}</li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <PreferencesBar />
          {session ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition cursor-pointer uppercase"
              aria-label={t("signOut")}
            >
              <LogOut className="h-4 w-4 text-cyan-600" /> {t("signOut")}
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/15 transition-all duration-300 hover:scale-105 cursor-pointer uppercase"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-slate-800 dark:text-slate-200"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 px-6 pb-6 shadow-lg">
          <ul className="flex flex-col gap-4 pt-4">
            {navItems.map((item) => (
              <li key={item.key}>{renderItem(item, () => setOpen(false))}</li>
            ))}
            <li className="pt-2 border-t border-slate-200 dark:border-slate-900">
              <PreferencesBar />
            </li>
            {session ? (
              <li>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition w-full justify-center"
                >
                  <LogOut className="h-4 w-4 text-cyan-600" /> {t("signOut")}
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow w-full text-center uppercase"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
