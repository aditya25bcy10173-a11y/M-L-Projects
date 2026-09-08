import { Language } from "@/contexts/LanguageContext";

export const langMap: Record<Language, string> = {
  English: "en-US",
  "हिन्दी": "hi-IN",
  "Español": "es-ES",
  "Français": "fr-FR",
  "Deutsch": "de-DE",
  "中文": "zh-CN"
};

export const getFemaleVoice = (voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | undefined => {
  const targetLangPrefix = (targetLang || "").split("-")[0].toLowerCase();

  // 1. Try to find a female voice matching the exact target language code (e.g. en-US, hi-IN)
  let femaleVoice = voices.find(v => 
    v.lang && v.name &&
    v.lang.toLowerCase() === targetLang.toLowerCase() && 
    /female|zira|samantha|karen|moira|tessa|victoria|susan|kalpana|heera|hazel|sri|swara|girl|woman/i.test(v.name)
  );

  // 2. Try to find a female voice matching the language prefix (e.g. en, hi)
  if (!femaleVoice) {
    femaleVoice = voices.find(v => 
      v.lang && v.name &&
      v.lang.toLowerCase().startsWith(targetLangPrefix) && 
      /female|zira|samantha|karen|moira|tessa|victoria|susan|kalpana|heera|hazel|sri|swara|girl|woman/i.test(v.name)
    );
  }

  // 3. Try to find any female voice (even if not target language, e.g. English female voice as fallback)
  if (!femaleVoice) {
    femaleVoice = voices.find(v => 
      v.name &&
      /female|zira|samantha|karen|moira|tessa|victoria|susan|kalpana|heera|hazel|sri|swara|girl|woman/i.test(v.name)
    );
  }

  // 4. Try to find a voice in the target language that is not explicitly male
  if (!femaleVoice) {
    femaleVoice = voices.find(v => 
      v.lang && v.name &&
      v.lang.toLowerCase().startsWith(targetLangPrefix) && 
      !/male|david|ravi|hemant|george|mark|pavel|stefan/i.test(v.name)
    );
  }

  // 5. Fallback to any voice matching target language prefix
  if (!femaleVoice) {
    femaleVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(targetLangPrefix));
  }

  return femaleVoice;
};

export const speakTextWithAdhiraVoice = (text: string, language: Language) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const targetLang = langMap[language] || "en-US";
  utterance.lang = targetLang;

  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = getFemaleVoice(voices, targetLang);
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  window.speechSynthesis.speak(utterance);
};
