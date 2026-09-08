import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, ShieldCheck, Brain, Loader2, Twitter, Github, Linkedin, ArrowRight, Shield, Sparkles, PhoneCall, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import ParticlesBackground from "@/components/ParticlesBackground";

const AshokaChakra = ({ className = "h-5 w-5" }) => (
  <svg className={`${className} text-blue-600 dark:text-cyan-500 animate-spin-slow`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 15 * Math.PI) / 180;
      const x2 = 12 + 10 * Math.cos(angle);
      const y2 = 12 + 10 * Math.sin(angle);
      return <line key={i} x1="12" y1="12" x2={x2} y2={y2} stroke="currentColor" />;
    })}
  </svg>
);

const tabContent: Record<string, Record<string, { title: string; subtitle: string; icon: any; details: string[] }>> = {
  English: {
    home: {
      title: "Smart Triage & Dashboard",
      subtitle: "Instant clinical screening at your fingertips",
      icon: Sparkles,
      details: [
        "7 diagnostic modules including Cardiovascular, Oncology, Arthritis, COVID-19, and TB",
        "Interactive AI assistant (Adhira) to guide symptom triaging in real-time",
        "Direct navigation CTAs to launch checkers instantly based on symptom descriptions"
      ]
    },
    info: {
      title: "100% Client-Side Privacy",
      subtitle: "Zero data uploads, total local execution",
      icon: Shield,
      details: [
        "All calculations run in your browser's JavaScript engine",
        "No patient records, inputs, or risk scores are sent to backend databases",
        "Download completely private, locally-generated PDF medical prescriptions"
      ]
    },
    ai: {
      title: "Deep Learning Ensemble",
      subtitle: "Advanced hybrid diagnostic models",
      icon: Brain,
      details: [
        "Calibrated 4-layer client-side Multilayer Perceptron (MLP) neural classifier",
        "Combined with weighted clinical Logistic Regression for top risk-factor highlight",
        "Explainable AI outputs with real-time confidence scores and probabilities"
      ]
    },
    contact: {
      title: "Support & Collaboration",
      subtitle: "Developed by Team HELIOS",
      icon: PhoneCall,
      details: [
        "Open-source clinical intelligence project built for hackathons",
        "Connect with developers or view documentation for deployment guide",
        "Configured for instant scaling and Supabase Edge Function integrations"
      ]
    }
  },
  "हिन्दी": {
    home: {
      title: "स्मार्ट ट्राइएज और डैशबोर्ड",
      subtitle: "आपकी उंगलियों पर त्वरित नैदानिक स्क्रीनिंग",
      icon: Sparkles,
      details: [
        "हृदय रोग, ऑन्कोलॉजी, गठिया, कोविड-19 और टीबी सहित 7 नैदानिक मॉड्यूल",
        "वास्तविक समय में लक्षणों के आधार पर मार्गदर्शन करने के लिए एआई सहायक (अधिरा)",
        "सटीक स्क्रीनिंग के लिए आसान और त्वरित नेविगेशन बटन"
      ]
    },
    info: {
      title: "100% क्लाइंट-साइड गोपनीयता",
      subtitle: "कोई डेटा अपलोड नहीं, पूरी तरह स्थानीय निष्पादन",
      icon: Shield,
      details: [
        "सभी गणनाएँ आपके ब्राउज़र के जावास्क्रिप्ट इंजन में चलती हैं",
        "कोई भी मरीज रिकॉर्ड, इनपुट या जोखिम स्कोर सर्वर पर नहीं भेजा जाता",
        "पूरी तरह से निजी और स्थानीय रूप से निर्मित पीडीएफ रिपोर्ट डाउनलोड करें"
      ]
    },
    ai: {
      title: "डीप लर्निंग मॉडल असेंबल",
      subtitle: "उन्नत हाइब्रिड नैदानिक मॉडल",
      icon: Brain,
      details: [
        "कैलिब्रेटेड 4-लेयर क्लाइंट-साइड न्यूरल नेटवर्क क्लासिफायर",
        "मुख्य जोखिम कारकों को दिखाने के लिए लॉजिस्टिक रिग्रेशन का मिश्रण",
        "वास्तविक समय में सटीकता स्कोर और संभावनाओं के साथ स्पष्ट आउटपुट"
      ]
    },
    contact: {
      title: "सहायता और सहयोग",
      subtitle: "टीम हीलियोस (HELIOS) द्वारा विकसित",
      icon: PhoneCall,
      details: [
        "राष्ट्रीय हैकाथॉन के लिए बनाया गया ओपन-सोर्स क्लीनिकल प्लेटफॉर्म",
        "डेवलपर्स से जुड़ें या सिस्टम डेप्लॉयमेंट गाइड के लिए डॉक्यूमेंटेशन देखें",
        "त्वरित स्केलिंग और सुपरबेस एज फंक्शन्स के साथ एकीकृत"
      ]
    }
  },
  "Español": {
    home: {
      title: "Triaje Inteligente y Panel",
      subtitle: "Cribado clínico instantáneo a su alcance",
      icon: Sparkles,
      details: [
        "7 módulos de diagnóstico que incluyen Cardiovascular, Oncología, Artritis, COVID-19 y TB",
        "Asistente interactiva de IA (Adhira) para guiar el triaje de síntomas en tiempo real",
        "Botones de navegación directa para iniciar las evaluaciones según los síntomas"
      ]
    },
    info: {
      title: "Privacidad 100% en el Cliente",
      subtitle: "Sin subida de datos, ejecución totalmente local",
      icon: Shield,
      details: [
        "Todos los cálculos se ejecutan en el motor JavaScript de su navegador",
        "No se envían registros de pacientes, entradas ni puntuaciones de riesgo a servidores",
        "Descargue recetas médicas en PDF generadas localmente y completamente privadas"
      ]
    },
    ai: {
      title: "Ensamble de Deep Learning",
      subtitle: "Modelos de diagnóstico híbridos avanzados",
      icon: Brain,
      details: [
        "Clasificador neuronal Perceptrón Multicapa (MLP) calibrado de 4 capas",
        "Combinado con Regresión Logística para resaltar los factores de riesgo principales",
        "Explicabilidad de la IA con puntuaciones de confianza y probabilidades en tiempo real"
      ]
    },
    contact: {
      title: "Soporte y Colaboración",
      subtitle: "Desarrollado por Team HELIOS",
      icon: PhoneCall,
      details: [
        "Proyecto de inteligencia clínica de código abierto diseñado para hackathons",
        "Conéctese con los desarrolladores o consulte la guía de despliegue",
        "Configurado para escalado instantáneo e integración con Supabase Edge Functions"
      ]
    }
  },
  "Français": {
    home: {
      title: "Triage Intelligent & Tableau",
      subtitle: "Dépistage clinique instantané à portée de main",
      icon: Sparkles,
      details: [
        "7 modules de diagnostic dont Cardiovasculaire, Oncologie, Arthrite, COVID-19 et TB",
        "Assistante IA interactive (Adhira) pour guider le triage des symptômes en temps réel",
        "Boutons d'accès direct pour lancer les dépistages basés sur les symptômes décrits"
      ]
    },
    info: {
      title: "Confidentialité 100% Client",
      subtitle: "Aucun transfert de données, exécution locale",
      icon: Shield,
      details: [
        "Tous les calculs s'exécutent dans le moteur JavaScript de votre navigateur",
        "Aucun dossier patient, saisie ou score de risque n'est envoyé aux serveurs",
        "Téléchargez des rapports PDF générés localement et confidentiels"
      ]
    },
    ai: {
      title: "Ensemble de Deep Learning",
      subtitle: "Modèles de diagnostic hybrides avancés",
      icon: Brain,
      details: [
        "Classifieur neuronal Perceptron Multicouche (MLP) local à 4 couches",
        "Combiné avec une régression logistique pour souligner les facteurs de risque clés",
        "Explicabilité IA avec scores de confiance et probabilités en temps réel"
      ]
    },
    contact: {
      title: "Support & Collaboration",
      subtitle: "Développé par la Team HELIOS",
      icon: PhoneCall,
      details: [
        "Projet d'intelligence clinique open source conçu pour les hackathons",
        "Contactez les développeurs ou consultez le guide de déploiement",
        "Configuré pour une mise à l'échelle instantanée et l'intégration Supabase"
      ]
    }
  },
  "Deutsch": {
    home: {
      title: "Intelligente Triage & Dashboard",
      subtitle: "Klinisches Screening auf Knopfdruck",
      icon: Sparkles,
      details: [
        "7 Diagnosemodule darunter Herz-Kreislauf, Onkologie, Arthritis, COVID-19 und TB",
        "Interaktive KI-Assistentin (Adhira) zur Symptomtriage in Echtzeit",
        "Direkte Navigationslinks zum sofortigen Starten der Früherkennungstests"
      ]
    },
    info: {
      title: "100% Client-Seitige Privatsphäre",
      subtitle: "Kein Daten-Upload, vollständig lokale Ausführung",
      icon: Shield,
      details: [
        "Alle Berechnungen laufen in der JavaScript-Engine Ihres Browsers",
        "Keine Patientendaten, Eingaben oder Risikowerte werden an Server gesendet",
        "Laden Sie absolut vertrauliche, lokal erstellte PDF-Rezepte herunter"
      ]
    },
    ai: {
      title: "Deep Learning Ensemble",
      subtitle: "Fortschrittliche hybride Diagnosemodelle",
      icon: Brain,
      details: [
        "Kalibriertes 4-schichtiges Multilayer-Perzeptron (MLP) neuronales Netzwerk",
        "Kombiniert mit logistischer Regression zur Anzeige der Hauptrisikofaktoren",
        "Erklärbare KI-Ergebnisse mit Konfidenzwerten und Wahrscheinlichkeiten"
      ]
    },
    contact: {
      title: "Support & Zusammenarbeit",
      subtitle: "Entwickelt von Team HELIOS",
      icon: PhoneCall,
      details: [
        "Open-Source-Projekt für klinische Intelligenz, entwickelt für Hackathons",
        "Kontaktieren Sie die Entwickler oder lesen Sie die Anleitung zur Bereitstellung",
        "Konfiguriert für sofortige Skalierung und Integration in Supabase Edge Functions"
      ]
    }
  },
  "中文": {
    home: {
      title: "智能分诊与控制台",
      subtitle: "触手可及的即时临床风险筛查",
      icon: Sparkles,
      details: [
        "包含心血管、肿瘤、关节炎、新冠和肺结核在内的7大诊断筛查模块",
        "智能互动AI助手 (Adhira) 实时根据症状描述引导分诊",
        "快速跳转操作按钮，基于描述快速启动对应筛查检测"
      ]
    },
    info: {
      title: "100% 浏览器端隐私保护",
      subtitle: "零数据上传，完全本地化运行",
      icon: Shield,
      details: [
        "所有算法计算完全在您浏览器的 JavaScript 引擎中本地运行",
        "绝不上传任何患者记录、表单输入或风险评分至云端数据库",
        "下载完全保密、本地实时生成的 PDF 医疗诊断报告与处方建议"
      ]
    },
    ai: {
      title: "深度神经网络集成",
      subtitle: "先进的混合临床预测模型",
      icon: Brain,
      details: [
        "经过校准的本地4层多层感知器 (MLP) 深度神经网络分类器",
        "结合加权临床逻辑回归，实现顶级患病风险因子的可视化解读",
        "可解释的 AI 输出，并配备实时模型可信度评分与概率"
      ]
    },
    contact: {
      title: "技术支持与合作",
      subtitle: "由 Team HELIOS 开发",
      icon: PhoneCall,
      details: [
        "为国家级黑客马拉松打造的开源医疗健康人工智能项目",
        "联系开发团队或查看系统部署配置指南",
        "已配置开箱即用扩展并深度整合 Supabase Edge Functions 边缘算力"
      ]
    }
  }
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loginAsGuest } = useAuth();
  const { language, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "info" | "ai" | "contact">("home");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true });
    }
  }, [session, navigate, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginAsGuest(email.trim() || undefined);
      toast.success("Welcome! Logged in successfully.");
      setLoading(false);
    }, 600);
  };

  // Get localized content based on selected language
  const activeLang = tabContent[language] ? language : "English";
  const content = tabContent[activeLang][activeTab];
  const IconComponent = content.icon;

  // Custom translations for page elements
  const pageT = {
    English: {
      guideTitle: "Platform Guide",
      freeLogin: "LOGIN FREE",
      desc: "Instant access to all screening systems",
      placeholder: "Email address (optional)",
      button: "Login Free",
      note: "No password or registration required. Free access.",
      social: "Social Media"
    },
    "हिन्दी": {
      guideTitle: "प्लेटफॉर्म गाइड",
      freeLogin: "निशुल्क लॉगिन",
      desc: "सभी स्क्रीनिंग प्रणालियों तक तुरंत पहुंचें",
      placeholder: "ईमेल पता (वैकल्पक)",
      button: "लॉगिन करें",
      note: "कोई पासवर्ड या पंजीकरण आवश्यक नहीं है। पूरी तरह मुफ्त।",
      social: "सोशल मीडिया"
    },
    "Español": {
      guideTitle: "Guía de la Plataforma",
      freeLogin: "ACCESO GRATUITO",
      desc: "Acceso instantáneo a todos los cribados",
      placeholder: "Correo electrónico (opcional)",
      button: "Entrar Gratis",
      note: "Sin contraseñas ni registro. Acceso completamente libre.",
      social: "Redes Sociales"
    },
    "Français": {
      guideTitle: "Guide Plateforme",
      freeLogin: "ACCÈS GRATUIT",
      desc: "Accès instantané à tous les dépistages",
      placeholder: "Adresse e-mail (facultatif)",
      button: "Connexion Gratuite",
      note: "Aucun mot de passe ou inscription requis. Accès libre.",
      social: "Réseaux Sociaux"
    },
    "Deutsch": {
      guideTitle: "Handbuch",
      freeLogin: "KOSTENLOS EINLOGGEN",
      desc: "Sofortiger Zugriff auf alle Diagnose-Module",
      placeholder: "E-Mail-Adresse (optional)",
      button: "Kostenlos Anmelden",
      note: "Kein Passwort oder Registrierung erforderlich. Freier Zugang.",
      social: "Soziale Medien"
    },
    "中文": {
      guideTitle: "导航说明书",
      freeLogin: "免密快捷登录",
      desc: "即刻免密码体验全部筛查系统",
      placeholder: "电子邮件地址（选填）",
      button: "免费一键登录",
      note: "无需任何密码或注册流程。完全免费开放。",
      social: "社交媒体链接"
    }
  }[activeLang];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 24s linear infinite;
        }
      `}</style>
      {/* Particles background for premium visual effects */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      {/* LEFT PANEL - Branded Platform Info (Interacts with Right Menu Selection) */}
      <div className="hidden md:flex md:w-[58%] bg-gradient-to-br from-teal-950 via-slate-900 to-black p-12 flex-col justify-between relative overflow-hidden border-r border-border/20 z-10">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-accent/15 blur-[120px]" />

        {/* Top Logo */}
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-hero-gradient shadow-lg shadow-primary/30">
            <span className="absolute inset-0 rounded-xl bg-hero-gradient blur-md opacity-60 animate-pulse" />
            <Heart className="relative h-6 w-6 text-primary-foreground fill-primary-foreground" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">
            AI Early <span className="text-gradient">Detector</span>
          </span>
        </div>

        {/* Interactive content section */}
        <div className="my-auto max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-primary">
            <IconComponent className="h-4 w-4" />
            <span>{content.title}</span>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl leading-tight">
              {content.title}
            </h2>
            <p className="text-base text-gray-400 font-medium">
              {content.subtitle}
            </p>
          </div>

          <ul className="space-y-3.5 pt-4">
            {content.details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold mt-0.5">
                  ✓
                </span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Platform Tagline */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure Clinical Intelligence Platform • 100% Client-Side Inference</span>
          </div>
          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xl">
            <div className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-white/10 relative">
              <AshokaChakra className="h-7 w-7" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                Indian Innovation Showcase <span className="text-orange-400">🇮🇳</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Engineered with pride in India. Built with a vision to leverage edge AI neural networks to solve global healthcare accessibility challenges.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Area and Bullet Menu (Matches Sketch) */}
      <div className="w-full md:w-[42%] bg-background/95 backdrop-blur-sm p-8 sm:p-12 flex flex-col justify-between relative z-10 min-h-screen">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
              <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">AI Early Detector</span>
          </div>
          {/* Tricolor badge for mobile */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-[10px] font-bold text-foreground select-none">
            <span className="flex items-center gap-0.5">
              <span className="h-1.5 w-1 bg-[#FF9933] rounded-l-sm" />
              <span className="h-1.5 w-1 bg-white flex items-center justify-center text-[2px] text-[#000080]">●</span>
              <span className="h-1.5 w-1 bg-[#128807] rounded-r-sm" />
            </span>
            <span>🇮🇳 India</span>
          </div>
        </div>

        {/* TOP: LOGIN Box */}
        <div className="w-full max-w-sm mx-auto my-auto space-y-8">
          <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur p-6 sm:p-8 card-glow shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded-full text-[10px] font-bold text-foreground mb-1 select-none">
                <span className="flex items-center gap-0.5">
                  <span className="h-2.5 w-1.5 bg-[#FF9933] rounded-l-sm" />
                  <span className="h-2.5 w-1.5 bg-white flex items-center justify-center text-[3px] text-[#000080]">●</span>
                  <span className="h-2.5 w-1.5 bg-[#128807] rounded-r-sm" />
                </span>
                <span>Proudly Engineered in India 🇮🇳</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{pageT.freeLogin}</h1>
              <p className="text-xs text-muted-foreground font-medium">{pageT.desc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={pageT.placeholder}
                  className="w-full px-4 py-3.5 rounded-xl bg-secondary/70 border border-border text-foreground text-sm focus:outline-none focus:border-primary/80 placeholder-muted-foreground/60 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-hero-gradient text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {pageT.button} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed font-medium">
              {pageT.note}
            </p>
          </div>

          {/* MIDDLE: Interactive Bullet Guide Menu (Matches Diagram) */}
          <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-400 delay-100">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground/80 px-1">
              {pageT.guideTitle}
            </h3>
            <ul className="space-y-2">
              {[
                { key: "home", label: { English: "🏠 Homepage", "हिन्दी": "🏠 मुख्य पृष्ठ", Español: "🏠 Página de Inicio", Français: "🏠 Page d'Accueil", Deutsch: "🏠 Startseite", 中文: "🏠 平台首页" }[activeLang] },
                { key: "info", label: { English: "ℹ️ Information / Privacy", "हिन्दी": "ℹ️ जानकारी / गोपनीयता", Español: "ℹ️ Privacidad y Datos", Français: "ℹ️ Confidentialité", Deutsch: "ℹ️ Privatsphäre", 中文: "ℹ️ 安全隐私说明" }[activeLang] },
                { key: "ai", label: { English: "🧠 AI Neural Engine", "हिन्दी": "🧠 एआई न्यूरल इंजन", Español: "🧠 Motor de IA", Français: "🧠 Moteur Neuronal", Deutsch: "🧠 KI-Technologie", 中文: "🧠 AI 算法引擎" }[activeLang] },
                { key: "contact", label: { English: "📞 Contact Developer Team", "हिन्दी": "📞 डेवलपर टीम से संपर्क", Español: "📞 Contacto de Desarrolladores", Français: "📞 Équipe de Développeurs", Deutsch: "📞 Entwickler-Team", 中文: "📞 联系开发团队" }[activeLang] }
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <li key={tab.key}>
                    <button
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 font-medium text-sm flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-sm"
                          : "bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] bg-primary/15 text-primary font-extrabold px-1.5 py-0.5 rounded-md transition-all duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0"}`}>
                        ACTIVE
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* BOTTOM: Social Media Icons (Matches Diagram) */}
        <div className="w-full text-center pt-8 border-t border-border/30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
            {pageT.social}
          </p>
          <div className="flex items-center justify-center gap-4">
            {[
              { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
              { href: "https://github.com", icon: Github, label: "GitHub" },
              { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" }
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card hover:bg-secondary text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm"
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
