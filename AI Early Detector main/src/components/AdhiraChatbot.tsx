import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Shield, ArrowRight, Mic, MicOff, Volume2, VolumeX, Trash2, AlertTriangle, HelpCircle, CheckCircle, Heart, Camera, User, Accessibility, Activity, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { predict } from "@/lib/mlModel";
import { speakTextWithAdhiraVoice } from "@/lib/speech";
import AnatomicalBodyMap from "./AnatomicalBodyMap";
import PPGScanner from "./PPGScanner";
import { useVocalStress } from "@/hooks/useVocalStress";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  triageKey?: string; // Links to rich summary card data if applicable
}

// Localized symptom quick tags
const quickChips: Record<string, { label: string; text: string }[]> = {
  English: [
    { label: "Chest pain 🩺", text: "I have chest tightness and pressure" },
    { label: "Knee stiffness 🦴", text: "My knees feel stiff and swell in the morning" },
    { label: "High fever 🤒", text: "I have high fever, headache and dry cough" },
    { label: "Tiredness / Lump 🎗️", text: "I feel chronic fatigue and noticed a new lump" },
    { label: "Check Vitals 📊", text: "I want to calculate my BMI and blood pressure" }
  ],
  "हिन्दी": [
    { label: "छाती में दर्द 🩺", text: "मुझे छाती में भारीपन और दबाव महसूस हो रहा है" },
    { label: "घुटनों में अकड़न 🦴", text: "मेरे घुटनों में अकड़न और सुबह सूजन होती है" },
    { label: "तेज़ बुखार 🤒", text: "मुझे तेज़ बुखार, सिरदर्द और सूखी खांसी है" },
    { label: "थकान / गांठ 🎗️", text: "मुझे लगातार थकान है और शरीर में एक गांठ महसूस हुई है" },
    { label: "वाइटल्स मापें 📊", text: "मैं अपना बीएमआई और ब्लड प्रेशर मापना चाहता हूँ" }
  ],
  "Español": [
    { label: "Dolor de pecho 🩺", text: "Tengo opresión y dolor en el pecho" },
    { label: "Rigidez articulaciones 🦴", text: "Siento rigidez en mis rodillas y se hinchan" },
    { label: "Fiebre alta 🤒", text: "Tengo fiebre alta, dolor de cabeza y tos seca" },
    { label: "Cansancio / Bulto 🎗️", text: "Siento fatiga crónica y noté un bulto nuevo" },
    { label: "Signos Vitales 📊", text: "Quiero calcular mi IMC y presión arterial" }
  ],
  "Français": [
    { label: "Douleur poitrine 🩺", text: "J'ai une oppression thoracique et de la douleur" },
    { label: "Raideur genoux 🦴", text: "Mes genoux sont raides et enflent le matin" },
    { label: "Forte fièvre 🤒", text: "J'ai une forte fièvre, mal à la tête et toux sèche" },
    { label: "Fatigue / Grosseur 🎗️", text: "Je ressens une fatigue chronique et j'ai une bosse" },
    { label: "Signes Vitaux 📊", text: "Je veux calculer mon IMC et ma tension" }
  ],
  "Deutsch": [
    { label: "Brustschmerz 🩺", text: "Ich habe ein Engegefühl in der Brust" },
    { label: "Gelenksteife 🦴", text: "Meine Knie sind steif und morgens geschwollen" },
    { label: "Hohes Fieber 🤒", text: "Ich habe hohes Fieber, Kopfschmerzen und Reizhusten" },
    { label: "Müdigkeit / Knoten 🎗️", text: "Ich bin ständig müde und habe einen neuen Knoten bemerkt" },
    { label: "Vitalwerte 📊", text: "Ich möchte meinen BMI und Blutdruck berechnen" }
  ],
  "中文": [
    { label: "胸闷胸痛 🩺", text: "我感到胸部有压迫感和疼痛" },
    { label: "关节僵硬 🦴", text: "我的膝盖感到僵硬且早晨会肿胀" },
    { label: "高烧不退 🤒", text: "我发高烧，头痛且有干咳" },
    { label: "疲劳与肿块 🎗️", text: "我感到长期慢性疲劳，并且发现了一个新肿块" },
    { label: "健康生命体征 📊", text: "我想计算我的 BMI 以及测量血压" }
  ]
};

// Rich Triage Cards Config
interface TriageCardDetails {
  severity: "urgent" | "moderate" | "info";
  title: string;
  desc: string;
  route: string;
  btnLabel: string;
}

const triageTranslations: Record<string, Record<string, TriageCardDetails>> = {
  English: {
    heart: { severity: "urgent", title: "Urgent Cardiovascular Screen", desc: "Symptom logs suggest potential cardiovascular distress. Access the Heart Attack screener immediately.", route: "/heart", btnLabel: "Start Heart Check" },
    arthritis: { severity: "moderate", title: "Arthritic Symptom Evaluation", desc: "Joint stiffness patterns indicate potential arthritic concern. Running the screener is recommended.", route: "/arthritis", btnLabel: "Start Arthritis Check" },
    covid: { severity: "moderate", title: "Viral Screening Recommended", desc: "Symptom logs align with viral respiratory infection. Consider running the COVID-19 risk check.", route: "/covid", btnLabel: "Start COVID Check" },
    tb: { severity: "urgent", title: "Urgent Respiratory Screen", desc: "Respiratory symptoms suggest potential tuberculosis risk. Access the TB risk screener immediately.", route: "/tb", btnLabel: "Start TB Check" },
    cancer: { severity: "moderate", title: "Oncological Risk Check", desc: "Symptom indicators warrant a preventive Cancer risk screening. Complete the assessment.", route: "/cancer", btnLabel: "Start Cancer Check" },
    aids: { severity: "moderate", title: "Confidential HIV/AIDS Screen", desc: "Symptom signals warrant a structured, confidential HIV/AIDS clinical risk assessment.", route: "/aids", btnLabel: "Start HIV Check" },
    vitals: { severity: "info", title: "Health Vitals Tracker", desc: "Use the local vital signs engine to calculate BMI, target heart zones, and blood pressure.", route: "/vitals", btnLabel: "Open Vitals Tracker" },
    reports: { severity: "info", title: "Medical Report Interpretation", desc: "Upload and analyze your medical prescription or report summary securely.", route: "/reports", btnLabel: "Open Report Analyzer" }
  },
  "हिन्दी": {
    heart: { severity: "urgent", title: "त्वरित हृदय रोग जांच", desc: "आपके लक्षण संभावित हृदय रोग का संकेत देते हैं। तुरंत हार्ट अटैक जांच मॉड्यूल शुरू करें।", route: "/heart", btnLabel: "हार्ट चेक शुरू करें" },
    arthritis: { severity: "moderate", title: "गठिया लक्षण मूल्यांकन", desc: "जोड़ों में अकड़न संभावित गठिया का संकेत देती है। गठिया जांच करने की सलाह दी जाती है।", route: "/arthritis", btnLabel: "गठिया चेक शुरू करें" },
    covid: { severity: "moderate", title: "वायरल संक्रमण जांच", desc: "लक्षण वायरल श्वसन संक्रमण के साथ मेल खाते हैं। कोविड-19 जांच मॉड्यूल चलाएं।", route: "/covid", btnLabel: "कोविड चेक शुरू करें" },
    tb: { severity: "urgent", title: "त्वरित श्वसन संबंधी जांच", desc: "लक्षण फेफड़ों में संक्रमण/टीबी का संकेत देते हैं। तुरंत टीबी जोखिम जांच मॉड्यूल चलाएं।", route: "/tb", btnLabel: "टीबी चेक शुरू करें" },
    cancer: { severity: "moderate", title: "कैंसर जोखिम स्क्रीनिंग", desc: "सचेत करने वाले लक्षण कैंसर स्क्रीनिंग की आवश्यकता दर्शाते हैं। कृपया मूल्यांकन पूरा करें।", route: "/cancer", btnLabel: "कैंसर चेक शुरू करें" },
    aids: { severity: "moderate", title: "गोपनीय एचआईवी/एड्स जांच", desc: "लक्षणों के आधार पर गोपनीय और सुरक्षित एचआईवी/एड्स जांच करने की सलाह दी जाती है।", route: "/aids", btnLabel: "एचआईवी चेक शुरू करें" },
    vitals: { severity: "info", title: "वाइटल्स हेल्थ ट्रैकर", desc: "बीएमआई, कार्डियो जोन और रक्तचाप की गणना करने के लिए स्थानीय वाइटल्स ट्रैकर का उपयोग करें।", route: "/vitals", btnLabel: "वाइटल्स ट्रैकर खोलें" },
    reports: { severity: "info", title: "मेडिकल रिपोर्ट विश्लेषण", desc: "अपनी मेडिकल रिपोर्ट या डॉक्टर के पर्चे का सुरक्षित एआई विश्लेषण करने के लिए यहां जाएं।", route: "/reports", btnLabel: "रिपोर्ट विश्लेषक खोलें" }
  },
  "Español": {
    heart: { severity: "urgent", title: "Cribado Cardiovascular Urgente", desc: "Sus síntomas sugieren posible distress cardiovascular. Acceda al evaluador de Ataque Cardíaco inmediatamente.", route: "/heart", btnLabel: "Iniciar Chequeo Cardíaco" },
    arthritis: { severity: "moderate", title: "Evaluación de Síntomas de Artritis", desc: "La rigidez articular indica preocupación de artritis. Se recomienda realizar la evaluación.", route: "/arthritis", btnLabel: "Iniciar Chequeo de Artritis" },
    covid: { severity: "moderate", title: "Cribado Viral Recomendado", desc: "Sus síntomas coinciden con infección respiratoria viral. Considere el chequeo de COVID-19.", route: "/covid", btnLabel: "Iniciar Chequeo COVID" },
    tb: { severity: "urgent", title: "Cribado Respiratorio Urgente", desc: "Los síntomas respiratorios sugieren posible riesgo de tuberculosis. Acceda al evaluador de TB.", route: "/tb", btnLabel: "Iniciar Chequeo TB" },
    cancer: { severity: "moderate", title: "Evaluación de Riesgo Oncológico", desc: "Los indicadores de síntomas justifican un cribado preventivo de cáncer. Complete la evaluación.", route: "/cancer", btnLabel: "Iniciar Chequeo de Cáncer" },
    aids: { severity: "moderate", title: "Cribado Confidencial de VIH/SIDA", desc: "Las señales justifican una evaluación clínica estructurada y confidencial de VIH/SIDA.", route: "/aids", btnLabel: "Iniciar Chequeo VIH" },
    vitals: { severity: "info", title: "Rastreador de Constantes Vitales", desc: "Utilice la herramienta local para calcular IMC, zonas cardíacas y presión arterial.", route: "/vitals", btnLabel: "Abrir Rastreador" },
    reports: { severity: "info", title: "Interpretación de Informes Médicos", desc: "Suba y analice sus recetas o informes médicos de forma segura.", route: "/reports", btnLabel: "Abrir Analizador" }
  },
  "Français": {
    heart: { severity: "urgent", title: "Dépistage Cardiovasculaire Urgent", desc: "Vos symptômes suggèrent une détresse cardiovasculaire. Accédez au dépistage immédiatement.", route: "/heart", btnLabel: "Dépistage Cardiaque" },
    arthritis: { severity: "moderate", title: "Évaluation de l'Arthrite", desc: "Des raideurs articulaires indiquent un risque d'arthrite. Ce dépistage est recommandé.", route: "/arthritis", btnLabel: "Dépistage Arthrite" },
    covid: { severity: "moderate", title: "Dépistage Viral Recommandé", desc: "Les symptômes correspondent à une infection virale. Lancez le dépistage COVID-19.", route: "/covid", btnLabel: "Dépistage COVID" },
    tb: { severity: "urgent", title: "Dépistage Respiratoire Urgent", desc: "Les symptômes indiquent un risque de tuberculose. Lancez le dépistage TB immédiatement.", route: "/tb", btnLabel: "Dépistage TB" },
    cancer: { severity: "moderate", title: "Dépistage du Cancer", desc: "Ces indicateurs justifient un dépistage préventif du cancer. Remplissez le formulaire.", route: "/cancer", btnLabel: "Dépistage Cancer" },
    aids: { severity: "moderate", title: "Dépistage Confidentiel VIH/SIDA", desc: "Ces signaux suggèrent d'effectuer un dépistage clinique confidentiel du VIH/SIDA.", route: "/aids", btnLabel: "Dépistage VIH" },
    vitals: { severity: "info", title: "Rastreador de Constantes", desc: "Calculez votre IMC, vos zones de fréquence cardiaque et votre tension en local.", route: "/vitals", btnLabel: "Ouvrir Signes Vitaux" },
    reports: { severity: "info", title: "Analyse des Rapports Médicaux", desc: "Téléversez et analysez vos ordonnances ou comptes-rendus médicaux en toute sécurité.", route: "/reports", btnLabel: "Ouvrir l'Analyseur" }
  },
  "Deutsch": {
    heart: { severity: "urgent", title: "Dringende Herzuntersuchung", desc: "Symptome weisen auf kardiovaskuläre Probleme hin. Starten Sie sofort den Herzinfarkt-Test.", route: "/heart", btnLabel: "Herz-Test Starten" },
    arthritis: { severity: "moderate", title: "Arthritis-Symptomanalyse", desc: "Gelenksteife deutet auf Arthritis hin. Die Durchführung des Früherkennungstests wird empfohlen.", route: "/arthritis", btnLabel: "Arthritis-Test Starten" },
    covid: { severity: "moderate", title: "Empfohlenes Viren-Screening", desc: "Ihre Symptome passen zu einem viralen Atemwegsinfekt. Machen Sie den COVID-19-Test.", route: "/covid", btnLabel: "COVID-Test Starten" },
    tb: { severity: "urgent", title: "Dringende Atemwegsuntersuchung", desc: "Atemwegssymptome deuten auf Tuberkulose-Risiko hin. Starten Sie sofort den TB-Test.", route: "/tb", btnLabel: "TB-Test Starten" },
    cancer: { severity: "moderate", title: "Krebsrisiko-Früherkennung", desc: "Diese Warnsignale erfordern ein präventives Krebsscreening. Füllen Sie den Test aus.", route: "/cancer", btnLabel: "Krebs-Test Starten" },
    aids: { severity: "moderate", title: "Vertraulicher HIV/AIDS-Test", desc: "Die Indikatoren rechtfertigen eine strukturierte, vertrauliche HIV/AIDS-Risikobewertung.", route: "/aids", btnLabel: "HIV-Test Starten" },
    vitals: { severity: "info", title: "Vitaldaten-Tracker", desc: "Berechnen Sie lokal Ihren BMI, Herzfrequenzbereiche und den mittleren arteriellen Druck.", route: "/vitals", btnLabel: "Tracker Öffnen" },
    reports: { severity: "info", title: "Berichtsanalyse (PDF)", desc: "Laden Sie Ihre ärztlichen Befunde oder Rezepte hoch und analysieren Sie diese sicher.", route: "/reports", btnLabel: "Analyser Öffnen" }
  },
  "中文": {
    heart: { severity: "urgent", title: "紧急心血管病症筛查", desc: "症状指征表明可能存在潜在的心血管紧急情况。请立即启动心脏病风险评估筛查器。", route: "/heart", btnLabel: "启动心脏筛查" },
    arthritis: { severity: "moderate", title: "关节炎病症科学评估", desc: "关节僵硬和肿胀模式表明存在潜在的关节炎风险。推荐运行该筛查模型。", route: "/arthritis", btnLabel: "启动关节炎筛查" },
    covid: { severity: "moderate", title: "推荐进行病毒筛查", desc: "症状指标与病毒性呼吸道感染高度吻合。建议启动 COVID-19 快速检测。", route: "/covid", btnLabel: "启动新冠筛查" },
    tb: { severity: "urgent", title: "紧急肺部呼吸道筛查", desc: "持续的呼吸道不良体征显示有肺结核患病风险。请立即启用 TB 专项筛查。", route: "/tb", btnLabel: "启动结核筛查" },
    cancer: { severity: "moderate", title: "预防性肿瘤风险评估", desc: "发现身体红线警告，建议完成预防性癌症风险筛查，生成诊断报告。", route: "/cancer", btnLabel: "启动癌症筛查" },
    aids: { severity: "moderate", title: "机密艾滋病/HIV风险筛查", desc: "临床关联因素建议启动结构化且严格保密的艾滋病/HIV专业临床评测。", route: "/aids", btnLabel: "启动HIV筛查" },
    vitals: { severity: "info", title: "生命体征健康追踪", desc: "使用端侧算法评估您的 BMI、最大心率区间以及平均动脉压数据。", route: "/vitals", btnLabel: "打开生命体征引擎" },
    reports: { severity: "info", title: "医疗报告智能解析", desc: "本地上传您的电子病历或处方 PDF 文件，实现自动数据字段提取和解读。", route: "/reports", btnLabel: "打开报告解析器" }
  }
};

// Inline Simplified Questionnaire details
const inlineQuestions = {
  heart: [
    { q: "Chest pain or pressure?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.7, 0.4, 0] },
    { q: "Pain radiating to arm/jaw/back?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.7, 0.4, 0] },
    { q: "Shortness of breath on activity?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.6, 0.3, 0] },
    { q: "High blood pressure?", o: ["Yes", "No"], r: [1, 0] },
    { q: "High cholesterol?", o: ["Yes", "No"], r: [1, 0] }
  ],
  cancer: [
    { q: "Unexplained weight loss?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.7, 0.4, 0] },
    { q: "Persistent fatigue?", o: ["Daily", "Often", "Sometimes", "No"], r: [1, 0.7, 0.4, 0] },
    { q: "Any new lump or swelling?", o: ["Yes", "Unsure", "Rarely", "No"], r: [1, 0.7, 0.4, 0] },
    { q: "Smoking or tobacco use?", o: ["Regular", "Occasional", "Quit", "Never"], r: [1, 0.6, 0.3, 0] }
  ],
  arthritis: [
    { q: "Joint stiffness or swelling?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.7, 0.3, 0] },
    { q: "Pain worse in the morning?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.6, 0.3, 0] },
    { q: "Difficulty doing daily tasks?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] }
  ]
};

const inlineWeights = {
  heart: { bias: -1.8, weights: [0.8, 0.6, 0.5, 0.4, 0.3] },
  cancer: { bias: -2.0, weights: [0.6, 0.5, 0.7, 0.5] },
  arthritis: { bias: -1.2, weights: [0.7, 0.6, 0.5] }
};

const AdhiraChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/adhira-avatar.png");
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  
  // Advanced features states
  const [activeProfile, setActiveProfile] = useState<"Self" | "Mother" | "Child">("Self");
  const [bodyMapOpen, setBodyMapOpen] = useState(false);
  
  // PPG states
  const [ppgActive, setPpgActive] = useState(false);

  // Inline triage states
  const [inlineTriage, setInlineTriage] = useState<{
    active: boolean;
    module: "heart" | "cancer" | "arthritis";
    index: number;
    answers: number[];
  } | null>(null);

  // Vocal stress integration hook
  const { vocalStress, setVocalStress, vocalStressScore } = useVocalStress(isListening);
  
  // Dynamic Canvas BFS Flood-fill to remove image background
  useEffect(() => {
    const img = new Image();
    img.src = "/adhira-avatar.png";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      const queue: [number, number][] = [];
      const visited = new Uint8Array(width * height);
      
      // Push all boundary pixels to the queue
      for (let x = 0; x < width; x++) {
        // top row
        queue.push([x, 0]);
        visited[x] = 1;
        // bottom row
        queue.push([x, height - 1]);
        visited[(height - 1) * width + x] = 1;
      }
      for (let y = 1; y < height - 1; y++) {
        // left column
        queue.push([0, y]);
        visited[y * width] = 1;
        // right column
        queue.push([width - 1, y]);
        visited[y * width + (width - 1)] = 1;
      }
      
      const isWhiteish = (r: number, g: number, b: number) => {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        // Background is neutral (low saturation) and bright (covers soft vignettes and floor shadows)
        return (max > 170 && diff < 20) || (r > 215 && g > 215 && b > 215);
      };
      
      let head = 0;
      while (head < queue.length) {
        const [cx, cy] = queue[head++];
        const idx = (cy * width + cx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (isWhiteish(r, g, b)) {
          // Make background pixel transparent
          data[idx + 3] = 0;
          
          // Add 4-connected neighbors
          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      try {
        setAvatarUrl(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Failed to generate transparent avatar: ", err);
      }
    };
  }, []);
  
  // Voice integration states
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem("adhira_voice_output") === "true";
  });
  
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Pre-load voices on component mount for Chrome / Safari compatibility
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Initialize browser speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      const voiceLang: Record<string, string> = {
        English: "en-US",
        "हिन्दी": "hi-IN",
        "Español": "es-ES",
        "Français": "fr-FR",
        "Deutsch": "de-DE",
        "中文": "zh-CN"
      };
      rec.lang = voiceLang[language] || "en-US";

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setVocalStress(false);
      };
      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };
      rec.onresult = (e: any) => {
        const resultText = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${resultText}` : resultText));
      };
      recognitionRef.current = rec;
    }
  }, [language]);

  // Load chat history from sessionStorage
  useEffect(() => {
    const history = sessionStorage.getItem(`adhira_chat_history_${activeProfile}`);
    if (history) {
      try {
        setMessages(JSON.parse(history));
        return;
      } catch (e) {
        sessionStorage.removeItem(`adhira_chat_history_${activeProfile}`);
      }
    }
    
    const savedName = localStorage.getItem("adhira_user_name");
    const profileGreeting = activeProfile === "Self" 
      ? (savedName ? `Welcome back, ${savedName}! I am Adhira, your AI health assistant. Describe what symptoms you are experiencing (e.g. chest pain, joint stiffness, cough), or ask me for a health joke or motivational quote! 🌸` : t("botWelcome"))
      : `Hello! I am Adhira, tracking health logs for ${activeProfile}. How is ${activeProfile === "Mother" ? "your Mother" : "your Child"} feeling today? Describe their symptoms or logs.`;
    const init = [
      {
        sender: "bot",
        text: profileGreeting,
      } as ChatMessage
    ];
    setMessages(init);
    sessionStorage.setItem(`adhira_chat_history_${activeProfile}`, JSON.stringify(init));
  }, [language, activeProfile]);

  // Save conversation log updates
  const saveChatHistory = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    sessionStorage.setItem(`adhira_chat_history_${activeProfile}`, JSON.stringify(newMsgs));
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      setPpgActive(false);
    }
  }, [isOpen]);

  // Speak bot text helper
  const speakText = (text: string) => {
    speakTextWithAdhiraVoice(text, language);
  };

  const toggleVoiceOutput = () => {
    const newVal = !voiceEnabled;
    setVoiceEnabled(newVal);
    localStorage.setItem("adhira_voice_output", String(newVal));
    if (!newVal && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    } else {
      toast.success(newVal ? "Speech Read-Aloud Enabled" : "Speech Read-Aloud Disabled");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const clearChat = () => {
    sessionStorage.removeItem(`adhira_chat_history_${activeProfile}`);
    const savedName = localStorage.getItem("adhira_user_name");
    const welcomeText = activeProfile === "Self" 
      ? (savedName ? `Welcome back, ${savedName}! I am Adhira, your AI health assistant. Describe what symptoms you are experiencing (e.g. chest pain, joint stiffness, cough), or ask me for a health joke or motivational quote! 🌸` : t("botWelcome"))
      : `Hello! I am Adhira, tracking health logs for ${activeProfile}. How is ${activeProfile === "Mother" ? "your Mother" : "your Child"} feeling today? Describe their symptoms or logs.`;
    const init = [
      {
        sender: "bot",
        text: welcomeText,
      } as ChatMessage
    ];
    setMessages(init);
    sessionStorage.setItem(`adhira_chat_history_${activeProfile}`, JSON.stringify(init));
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    toast.success("Chat history cleared");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    submitMessage(input.trim());
  };

  const handleProfileChange = (profile: "Self" | "Mother" | "Child") => {
    setActiveProfile(profile);
    toast.success(`Switched chat context to profile: ${profile}`);
  };

  const handlePpgScanComplete = (bpm: number) => {
    setPpgActive(false);
    
    // Save BPM to Vitals local storage logs
    const today = new Date().toISOString().split("T")[0];
    const cached = localStorage.getItem(`adhira_assistant_${today}`);
    let parsed: any = {};
    try {
      parsed = cached ? JSON.parse(cached) : {};
    } catch (e) {
      parsed = {};
    }
    parsed.heartRate = bpm;
    localStorage.setItem(`adhira_assistant_${today}`, JSON.stringify(parsed));

    const msgText = `❤️ PPG Vital Scan Complete! I analyzed your forehead skin volume pulse fluctuations via webcam and estimated your heart rate at **${bpm} BPM**. This vital has been successfully logged to your profile.`;
    const updatedMsgs = [
      ...messages,
      { sender: "user", text: "Camera Pulse Scan 📸" } as ChatMessage,
      { sender: "bot", text: msgText } as ChatMessage
    ];
    saveChatHistory(updatedMsgs);
  };

  const selectBodySymptom = (symptom: string) => {
    setBodyMapOpen(false);
    submitMessage(symptom);
  };

  const startInlineTriage = (module: "heart" | "cancer" | "arthritis") => {
    setInlineTriage({
      active: true,
      module,
      index: 0,
      answers: []
    });
    const firstQ = inlineQuestions[module][0].q;
    const updatedMsgs = [
      ...messages,
      { sender: "bot", text: `📋 starting inline diagnostic triage for **${module.toUpperCase()}** risk. Please select options below:\n\n**Question 1: ${firstQ}**` } as ChatMessage
    ];
    saveChatHistory(updatedMsgs);
  };

  const handleInlineAnswer = (optIndex: number) => {
    if (!inlineTriage) return;
    const { module, index, answers } = inlineTriage;
    const currentQ = inlineQuestions[module][index];
    const weightVal = currentQ.r[optIndex];
    const nextAnswers = [...answers, weightVal];

    const userMsg: ChatMessage = { sender: "user", text: currentQ.o[optIndex] };
    
    if (index + 1 < inlineQuestions[module].length) {
      const nextIndex = index + 1;
      const nextQ = inlineQuestions[module][nextIndex].q;
      setInlineTriage({
        ...inlineTriage,
        index: nextIndex,
        answers: nextAnswers
      });
      const updatedMsgs = [
        ...messages,
        userMsg,
        { sender: "bot", text: `**Question ${nextIndex + 1}: ${nextQ}**` } as ChatMessage
      ];
      saveChatHistory(updatedMsgs);
    } else {
      setIsTyping(true);
      setInlineTriage(null);
      setTimeout(() => {
        const weights = inlineWeights[module];
        const questionLabels = inlineQuestions[module].map((q) => q.q);
        const result = predict(nextAnswers, weights, questionLabels);

        let reports = [];
        try {
          reports = JSON.parse(localStorage.getItem("reports") || "[]");
          if (!Array.isArray(reports)) reports = [];
        } catch (e) {
          reports = [];
        }
        reports.push({
          date: new Date().toLocaleString(),
          score: result.riskScore.toFixed(2),
          risk: result.riskLevel + " Risk",
          model: `${module.toUpperCase()} (Inline)`,
        });
        localStorage.setItem("reports", JSON.stringify(reports));

        const botMsgText = `🏆 **Inline Triage Completed!**\n\n- **Model Risk Assessment**: ${result.riskLevel} Risk (${result.riskScore.toFixed(1)}%)\n- **Confidence**: ${result.confidence}%\n\n*Top Risk Factors identified:* \n${result.topFactors.map(f => `• ${f}`).join("\n")}\n\nI have saved this report to your medical history history.`;
        const updatedMsgs = [
          ...messages,
          userMsg,
          { sender: "bot", text: botMsgText } as ChatMessage
        ];
        setIsTyping(false);
        saveChatHistory(updatedMsgs);
      }, 1000);
    }
  };

  const handleConversationalAI = (text: string): { response: string; triageKey?: string } | null => {
    const raw = text.toLowerCase().trim();
    const savedName = localStorage.getItem("adhira_user_name");

    // SOS emergency alert trigger override
    if (raw === "sos" || raw.includes("emergency") || raw.includes("help me") || raw.includes("accident") || raw.includes("bleeding")) {
      return { 
        response: "🚨 EMERGENCY ALERT DETECTED: If you are in immediate danger or experiencing severe symptoms, please click the RED SOS button in our Doctor Hub or call local ambulance dispatch (102/100) immediately!",
        triageKey: "heart" // links to doctor/SOS routing
      };
    }

    // Name learning
    if (raw.startsWith("my name is ") || raw.startsWith("i am ") || raw.startsWith("call me ")) {
      const parts = raw.split(/(?:my name is|i am|call me)\s+/i);
      if (parts.length > 1 && parts[1].trim()) {
        const namePart = parts[1].trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        localStorage.setItem("adhira_user_name", capitalized);
        return { response: `Nice to meet you, ${capitalized}! 😊 I will remember your name for your health profile. How can I assist you today? Describe your symptoms, or ask me for a health quiz, joke, or fact!` };
      }
    }

    // Health jokes
    const jokes = [
      "Why did the computer go to the doctor? It had a virus! 💻",
      "Why did the pillow go to the medical clinic? It was feeling a bit down! 🛏️",
      "What did the blood cell say to the other? Let's stay positive! 🩸",
      "Why are surgeons so calm? They have a lot of patients! 🩺",
      "Why did the skeleton cross the road? To go to the body shop! 🦴"
    ];

    // Fun Health Facts
    const facts = [
      "Did you know? Laughing is good for your heart! It increases blood flow by 20% and reduces stress. 😂",
      "Fun fact: Your left lung is about 10% smaller than your right lung to make room for your heart. 🫁",
      "Did you know? Drinking enough water boosts your brain power, sleep quality, and mood. 💧",
      "Fun fact: The human nose can remember up to 50,000 different scents! 👃",
      "Did you know? Walking 30 minutes daily can lower your risk of stroke, heart disease, and diabetes significantly. 👣"
    ];

    // Motivational Quotes
    const quotes = [
      "\"It is health that is real wealth and not pieces of gold and silver.\" — Mahatma Gandhi 🌟",
      "\"A healthy outside starts from the healthy inside.\" — Robert Urich 🍃",
      "\"Your body hears everything your mind says. Keep it positive.\" — Unknown 💖",
      "\"Self-care is how you take your power back.\" — Lalah Delia 🌸",
      "\"The greatest wealth is health.\" — Virgil 🏆"
    ];

    if (raw === "joke" || raw.includes("tell me a joke") || raw.includes("funny")) {
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      return { response: randomJoke };
    }

    if (raw.includes("fun fact") || raw.includes("tell me a fact") || raw.includes("health fact")) {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      return { response: randomFact };
    }

    if (raw.includes("motivation") || raw.includes("motivate") || raw.includes("quote") || raw.includes("inspiring")) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      return { response: randomQuote };
    }

    // Greetings
    if (raw === "hi" || raw === "hello" || raw === "hey" || raw.startsWith("good morning") || raw.startsWith("good afternoon") || raw.startsWith("good evening")) {
      const timeGreeting = raw.startsWith("good morning") ? "Good morning" 
        : raw.startsWith("good afternoon") ? "Good afternoon" 
        : raw.startsWith("good evening") ? "Good evening" 
        : "Hello";
      const nameStr = savedName ? `, ${savedName}` : "";
      return { response: `${timeGreeting}${nameStr}! 👋 How are you feeling today? Tell me what symptoms you are experiencing, or ask me for a health joke or a motivational quote!` };
    }

    // Small Talk
    if (raw.includes("how are you") || raw.includes("how do you do")) {
      const nameStr = savedName ? `, ${savedName}` : "";
      return { response: `I'm functioning perfectly${nameStr}, thank you for asking! 🤖 I am ready to analyze any symptoms or vital logs you have. How can I help you?` };
    }

    if (raw.includes("who are you") || raw.includes("what is your name")) {
      return { response: "I am Adhira, your friendly AI Health Companion! 🤖 I can answer small talk, tell health jokes, share wellness tips, and guide you through our diagnostic screeners." };
    }

    return null;
  };

  const submitMessage = (text: string) => {
    const newMessages = [...messages, { sender: "user", text } as ChatMessage];
    saveChatHistory(newMessages);
    setInput("");
    setIsTyping(true);

    // AI triage delay simulation
    setTimeout(() => {
      const conv = handleConversationalAI(text);
      let botText = "";
      let triageKey: string | undefined = undefined;

      if (conv) {
        botText = conv.response;
        triageKey = conv.triageKey;
      } else {
        const triage = analyzeSymptoms(text);
        botText = t(triage.responseKey);
        triageKey = triage.triageKey || undefined;
      }

      // Append vocal stress context warning
      if (vocalStress) {
        botText += " \n\n*Note: I detected signs of stress in your vocal tone. Let's take a slow breath together.* 🧘";
        setVocalStress(false);
      }

      const updatedMsgs = [
        ...newMessages,
        {
          sender: "bot",
          text: botText,
          triageKey: triageKey
        } as ChatMessage
      ];

      setIsTyping(false);
      saveChatHistory(updatedMsgs);

      if (voiceEnabled) {
        speakText(botText);
      }
    }, 1200);
  };

  const handleChipClick = (txt: string) => {
    if (isTyping) return;
    submitMessage(txt);
  };

  // Symptoms triage keyword extractor
  const analyzeSymptoms = (text: string): { responseKey: string; triageKey?: string } => {
    const raw = text.toLowerCase();

    if (raw.includes("chest") || raw.includes("heart") || raw.includes("palpitation") || raw.includes("angina") || raw.includes("cardio") || raw.includes("shortness of breath") || raw.includes("left arm")) {
      return { responseKey: "botTriageHeart", triageKey: "heart" };
    }
    if (raw.includes("joint") || raw.includes("stiff") || raw.includes("arthritis") || raw.includes("knee") || raw.includes("elbow") || raw.includes("swelling in hands") || raw.includes("bone")) {
      return { responseKey: "botTriageArthritis", triageKey: "arthritis" };
    }
    if (raw.includes("covid") || raw.includes("corona") || raw.includes("fever") || raw.includes("loss of smell") || raw.includes("loss of taste") || raw.includes("sore throat")) {
      return { responseKey: "botTriageCovid", triageKey: "covid" };
    }
    if (raw.includes("coughing blood") || raw.includes("hemoptysis") || raw.includes("tuberculosis") || raw.includes("tb") || raw.includes("night sweat") || raw.includes("respiratory")) {
      return { responseKey: "botTriageTb", triageKey: "tb" };
    }
    if (raw.includes("cancer") || raw.includes("lump") || raw.includes("tumor") || raw.includes("unexplained weight loss") || raw.includes("skin mole") || raw.includes("unusual bleeding")) {
      return { responseKey: "botTriageCancer", triageKey: "cancer" };
    }
    if (raw.includes("hiv") || raw.includes("aids") || raw.includes("sexual") || raw.includes("needle") || raw.includes("lymph node")) {
      return { responseKey: "botTriageAids", triageKey: "aids" };
    }
    if (raw.includes("bp") || raw.includes("blood pressure") || raw.includes("bmi") || raw.includes("vitals") || raw.includes("weight") || raw.includes("height") || raw.includes("pulse")) {
      return { responseKey: "botTriageVitals", triageKey: "vitals" };
    }
    if (raw.includes("report") || raw.includes("pdf") || raw.includes("prescription") || raw.includes("medical file") || raw.includes("scan")) {
      return { responseKey: "botTriageVitals", triageKey: "reports" };
    }

    return { responseKey: "botTriageNone" };
  };

  const handleActionClick = (route: string) => {
    navigate(route);
    setIsOpen(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const activeLang = triageTranslations[language] ? language : "English";
  const chips = quickChips[activeLang] || quickChips["English"];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <style>{`
        @keyframes only-hand-wave {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(8deg); }
        }
        .animate-only-hand-wave {
          animation: only-hand-wave 1.6s ease-in-out infinite;
        }
        @keyframes pulse-heart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        .animate-beat {
          animation: pulse-heart 0.8s ease-in-out infinite;
        }
        @keyframes hologram-glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.55)) drop-shadow(0 0 22px rgba(236, 72, 153, 0.4)) drop-shadow(0 0 45px rgba(168, 85, 247, 0.25));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.85)) drop-shadow(0 0 32px rgba(236, 72, 153, 0.65)) drop-shadow(0 0 65px rgba(168, 85, 247, 0.45));
          }
        }
        .animate-hologram-glow {
          animation: hologram-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Button (FAB) */}
      {!isOpen && (
        <div className="relative group select-none">
          {/* Layered intense neon backglow halos behind the floating robot */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-cyan-400/40 via-pink-500/35 to-purple-600/40 rounded-full blur-3xl group-hover:scale-130 transition-all duration-500 -z-10 pointer-events-none opacity-100 animate-pulse" />
          <div className="absolute -inset-6 bg-gradient-to-br from-indigo-500/30 via-rose-400/25 to-emerald-400/20 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500 -z-10 pointer-events-none opacity-90 animate-pulse" style={{ animationDelay: '1.2s' }} />
          
          {/* Floating waving Adhira avatar */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-32 w-20 items-center justify-center hover:scale-115 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none animate-hologram-glow"
            aria-label="Open Adhira AI Assistant"
          >
            <img 
              src={avatarUrl} 
              alt="Adhira AI" 
              className="h-full w-full object-contain absolute inset-0 select-none transition-all duration-300 animate-waving-hand" 
            />
            
            {/* Minimal glowing badge indicating chat activity at the bottom corner */}
            <span className="absolute bottom-1 right-1 bg-emerald-500 h-3 w-3 rounded-full border border-background shadow-md animate-ping" />
            <span className="absolute bottom-1 right-1 bg-emerald-500 h-3 w-3 rounded-full border border-background shadow-md" />
          </button>
        </div>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className={`w-[380px] sm:w-[420px] h-[580px] rounded-2xl border bg-card/95 backdrop-blur card-glow shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in-50 zoom-in-95 ${
          activeProfile === "Self" ? "border-primary/50 shadow-primary/10" :
          activeProfile === "Mother" ? "border-pink-500/50 shadow-pink-500/10" :
          "border-amber-500/50 shadow-amber-500/10"
        }`}>
          {/* Header */}
          <div className={`px-4 py-4 flex items-center justify-between text-primary-foreground transition-colors duration-300 ${
            activeProfile === "Self" ? "bg-hero-gradient" :
            activeProfile === "Mother" ? "bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700" :
            "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
          }`}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/20 p-0.5">
                <img 
                  src={avatarUrl} 
                  alt="Adhira AI" 
                  className="h-full w-full object-contain select-none" 
                />
              </span>
              <div>
                <h3 className="font-bold text-base leading-tight">{t("botName")}</h3>
                <p className="text-[11px] text-primary-foreground/75 flex items-center gap-1 mt-0.5">
                  <Shield className="h-3 w-3 text-emerald-400" /> {t("botRole")}
                </p>
              </div>
            </div>
            
            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5">
              <select 
                value={activeProfile} 
                onChange={(e) => handleProfileChange(e.target.value as any)}
                className="bg-white/10 text-white border border-white/20 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer font-semibold max-w-[85px] mr-1"
              >
                <option value="Self" className="text-foreground">Self</option>
                <option value="Mother" className="text-foreground">Mother</option>
                <option value="Child" className="text-foreground">Child</option>
              </select>
              <button onClick={clearChat} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-primary-foreground transition cursor-pointer" title="Clear Chat"><Trash2 className="h-4.5 w-4.5" /></button>
              <button onClick={toggleVoiceOutput} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-primary-foreground transition cursor-pointer"><Volume2 className="h-4.5 w-4.5" /></button>
              <button onClick={() => { setIsOpen(false); if (window.speechSynthesis) window.speechSynthesis.cancel(); }} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-primary-foreground transition cursor-pointer"><X className="h-4.5 w-4.5" /></button>
            </div>
          </div>

          {/* Messages Window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/15 relative">
            {messages.map((msg, idx) => {
              const hasTriageCard = msg.sender === "bot" && msg.triageKey && triageTranslations[activeLang]?.[msg.triageKey];
              const triageData = hasTriageCard ? triageTranslations[activeLang][msg.triageKey!] : null;

              return (
                <div key={idx} className={`flex flex-col w-full ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] relative group ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none shadow-sm"}`}>
                    {msg.text}
                    {msg.sender === "bot" && (
                      <button onClick={() => speakText(msg.text)} className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 rounded-md bg-secondary hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200"><Volume2 className="h-3 w-3" /></button>
                    )}
                  </div>

                  {/* Rich Triage Card */}
                  {triageData && (
                    <div className={`mt-3 w-full max-w-[90%] rounded-2xl border p-4 shadow-md bg-card animate-in slide-in-from-top-2 duration-300 border-l-4 ${
                      triageData.severity === "urgent" ? "border-l-red-500 border-border" : triageData.severity === "moderate" ? "border-l-amber-500 border-border" : "border-l-emerald-500 border-border"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {triageData.severity === "urgent" ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded-full uppercase">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> Urgent Triage
                          </span>
                        ) : triageData.severity === "moderate" ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                            <HelpCircle className="h-3 w-3 shrink-0" /> Recommended Action
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                            <CheckCircle className="h-3 w-3 shrink-0" /> Local Tool Access
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-foreground mb-1">{triageData.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3.5 leading-relaxed">{triageData.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleActionClick(triageData.route)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-primary-foreground shadow transition cursor-pointer hover:opacity-95 ${triageData.severity === "urgent" ? "bg-red-600" : triageData.severity === "moderate" ? "bg-amber-600" : "bg-emerald-600"}`}>
                          {triageData.btnLabel} <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        {(msg.triageKey === "heart" || msg.triageKey === "cancer" || msg.triageKey === "arthritis") && (
                          <button onClick={() => startInlineTriage(msg.triageKey as any)} className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl text-primary-foreground bg-primary/95 shadow cursor-pointer hover:opacity-90">Start Triage Inline 💬</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col items-start mr-auto max-w-[80%]">
                <div className="p-3.5 bg-card border border-border text-foreground rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />

            {/* Vocal Stress Real-time Alert box */}
            {isListening && (
              <div className="absolute left-4 right-4 bottom-4 bg-card/95 backdrop-blur-md border border-border/80 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs animate-pulse shadow-lg z-40">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-foreground">Listening to Voice...</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Stress:</span>
                  <span className={`font-extrabold ${
                    vocalStressScore > 60 ? "text-red-500 animate-bounce" :
                    vocalStressScore > 35 ? "text-amber-500" :
                    "text-emerald-500"
                  }`}>
                    {vocalStressScore}% ({vocalStressScore > 60 ? "High" : vocalStressScore > 35 ? "Medium" : "Low"})
                  </span>
                </div>
              </div>
            )}

            {/* Body Map Overlay */}
            {bodyMapOpen && (
              <AnatomicalBodyMap 
                onSelectSymptom={selectBodySymptom} 
                onClose={() => setBodyMapOpen(false)} 
              />
            )}

            {/* PPG Scanner Overlay */}
            {ppgActive && (
              <PPGScanner 
                onScanComplete={handlePpgScanComplete} 
                onCancel={() => setPpgActive(false)} 
              />
            )}
          </div>

          {/* Scrolling Symptom Quick Chips */}
          <div className="px-3 py-2 bg-secondary/5 border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.text)}
                disabled={isTyping || inlineTriage?.active}
                className="shrink-0 px-3 py-1.5 rounded-full border border-border/80 bg-card hover:bg-secondary text-xs text-foreground font-medium hover:border-primary/40 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Inline Triage Question Toggles OR standard input Form */}
          {inlineTriage?.active ? (
            <div className="p-3 border-t border-border bg-card flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2 justify-center">
                {inlineQuestions[inlineTriage.module][inlineTriage.index].o.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleInlineAnswer(optIdx)}
                    className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setInlineTriage(null);
                  toast.info("Triage assessment cancelled");
                }}
                className="mx-auto px-4 py-1.5 rounded-lg border border-border text-muted-foreground text-[10px] font-bold hover:bg-secondary transition cursor-pointer"
              >
                Cancel Triage
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-1.5 items-center">
              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition cursor-pointer active:scale-95 ${
                  isListening
                    ? "bg-red-500/10 border-red-500/40 text-red-500 animate-pulse"
                    : "bg-secondary border-border hover:border-primary/30 text-muted-foreground"
                }`}
                title={isListening ? "Listening... Click to stop" : "Start Voice Input"}
              >
                {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
              </button>

              {/* Interactive SVG Body Map Trigger */}
              <button
                type="button"
                onClick={() => setBodyMapOpen(true)}
                disabled={isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-secondary border-border hover:border-primary/30 text-muted-foreground transition cursor-pointer active:scale-95 disabled:opacity-50"
                title="Open Body Map"
              >
                <Activity className="h-4.5 w-4.5" />
              </button>

              {/* Webcam PPG Pulse Scan Trigger */}
              <button
                type="button"
                onClick={() => setPpgActive(true)}
                disabled={isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-secondary border-border hover:border-primary/30 text-muted-foreground transition cursor-pointer active:scale-95 disabled:opacity-50"
                title="Scan Heart Rate"
              >
                <Camera className="h-4.5 w-4.5" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : t("botPlaceholder")}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-muted-foreground/70"
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hero-gradient text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdhiraChatbot;
