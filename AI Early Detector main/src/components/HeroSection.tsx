import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-cyan-50/40 to-transparent">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl text-slate-900 dark:text-white uppercase">
          {t("heroTitle")} <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">{t("heroGradient")}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          {t("heroSub")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all duration-300 hover:scale-105 uppercase"
          >
            {t("getStarted")} <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/vitals"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-800 uppercase"
          >
            {t("vitalsCalc")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
