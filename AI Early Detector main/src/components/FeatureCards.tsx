import { Stethoscope, ShieldCheck, FileText, HeartPulse, Activity, Wind, Droplet, Footprints, Brain, ShieldAlert, Utensils, BookOpen, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Triage screeners that will live inside the Modal
const triageModules = [
  {
    icon: HeartPulse,
    titleKey: "heartTitle",
    descKey: "heartDesc",
    link: "/heart",
    accent: "from-red-400 to-rose-600",
    iconBg: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  },
  {
    icon: Stethoscope,
    titleKey: "cancerTitle",
    descKey: "cancerDesc",
    link: "/cancer",
    accent: "from-rose-400 to-pink-500",
    iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
  },
  {
    icon: ShieldCheck,
    titleKey: "arthritisTitle",
    descKey: "arthritisDesc",
    link: "/arthritis",
    accent: "from-sky-400 to-blue-500",
    iconBg: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400",
  },
  {
    icon: Wind,
    titleKey: "covidTitle",
    descKey: "covidDesc",
    link: "/covid",
    accent: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Activity,
    titleKey: "tbTitle",
    descKey: "tbDesc",
    link: "/tb",
    accent: "from-yellow-400 to-amber-500",
    iconBg: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
  },
  {
    icon: Droplet,
    titleKey: "aidsTitle",
    descKey: "aidsDesc",
    link: "/aids",
    accent: "from-fuchsia-400 to-purple-500",
    iconBg: "bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-600 dark:text-fuchsia-400",
  },
];

// Main 8 cards displaying on the homepage grid
const mainFeatures = [
  {
    icon: Stethoscope,
    titleKey: "triageHubTitle",
    descKey: "triageHubDesc",
    isTriageHub: true,
    accent: "from-rose-500 via-pink-500 to-red-500",
    iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
  },
  {
    icon: FileText,
    titleKey: "reportsTitle",
    descKey: "reportsDesc",
    link: "/reports",
    accent: "from-emerald-400 to-teal-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Activity,
    titleKey: "vitalsTitle",
    descKey: "vitalsDesc",
    link: "/vitals",
    accent: "from-teal-400 to-emerald-600",
    iconBg: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
  },
  {
    icon: Footprints,
    titleKey: "assistantTitle",
    descKey: "assistantDesc",
    link: "/assistant",
    accent: "from-emerald-400 to-green-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Brain,
    titleKey: "mentalTitle",
    descKey: "mentalDesc",
    link: "/mental",
    accent: "from-purple-400 to-indigo-500",
    iconBg: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
  },
  {
    icon: ShieldAlert,
    titleKey: "doctorTitle",
    descKey: "doctorDesc",
    link: "/doctor",
    accent: "from-red-400 to-rose-500",
    iconBg: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
  },
  {
    icon: Utensils,
    titleKey: "diabetesTitle",
    descKey: "diabetesDesc",
    link: "/diabetes",
    accent: "from-cyan-400 to-sky-500",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: BookOpen,
    titleKey: "educationTitle",
    descKey: "educationDesc",
    link: "/education",
    accent: "from-indigo-400 to-violet-500",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
  },
];

const FeatureCards = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isTriageOpen, setIsTriageOpen] = useState(false);

  return (
    <section id="services" className="py-20 bg-slate-50/40 dark:bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200/50 dark:border-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3">
            {t("ourServices")}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            {t("servicesTitle")} <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">{t("servicesSubtitle")}</span>
          </h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            {t("servicesDesc")}
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3 place-items-stretch animate-in fade-in duration-300">
          {mainFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <button
                key={feat.titleKey}
                onClick={() => {
                  if (feat.isTriageHub) {
                    setIsTriageOpen(true);
                  } else if (feat.link) {
                    navigate(feat.link);
                  }
                }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-7 text-left border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feat.accent}`} />
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feat.iconBg} ring-1 ring-border/50 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    {t(feat.titleKey)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(feat.descKey)}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:translate-x-0.5">
                  {feat.isTriageHub ? "Explore Screeners" : t("openModule")} <span className="text-[10px]">➜</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glassmorphic Triage Hub Modal */}
      {isTriageOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300"
          onClick={() => setIsTriageOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient glows inside modal */}
            <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-rose-500/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />

            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-950/50">
                  <Stethoscope className="h-6 w-6 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                    {t("triageHubTitle")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("triageHubDesc")}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTriageOpen(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Grid of Screeners */}
            <div className="flex-1 overflow-y-auto pr-1 py-1 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {triageModules.map(({ icon: Icon, titleKey, descKey, link, accent, iconBg }) => (
                <button
                  key={titleKey}
                  onClick={() => {
                    setIsTriageOpen(false);
                    if (link) navigate(link);
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-card/40 hover:bg-white dark:hover:bg-card p-5 text-left border border-slate-150 dark:border-border/60 hover:border-slate-300 dark:hover:border-primary/40 shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ring-1 ring-border/40 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      {t(titleKey)}
                    </h4>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                      {t(descKey)}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:translate-x-0.5">
                    {t("openModule")} <span className="text-[9px]">➜</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeatureCards;
