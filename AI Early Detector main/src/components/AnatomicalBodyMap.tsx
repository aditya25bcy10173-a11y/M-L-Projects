import { X } from "lucide-react";

interface AnatomicalBodyMapProps {
  onSelectSymptom: (symptom: string) => void;
  onClose: () => void;
}

const AnatomicalBodyMap = ({ onSelectSymptom, onClose }: AnatomicalBodyMapProps) => {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col p-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
        <div>
          <h4 className="font-bold text-sm text-foreground">Anatomical Symptom Selector</h4>
          <p className="text-[10px] text-muted-foreground">Tap a glowing zone to report symptoms</p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-secondary text-muted-foreground transition cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative py-2">
        <svg className="w-auto h-[280px] text-muted-foreground/30 fill-none stroke-current" viewBox="0 0 100 150">
          <circle cx="50" cy="18" r="8" strokeWidth="1.5" className="text-muted-foreground/40" />
          <path d="M 47,26 L 47,29 M 53,26 L 53,29" strokeWidth="1.5" />
          <path d="M 32,32 L 68,32 C 68,32 63,55 61,65 C 61,65 58,92 56,92 L 44,92 C 42,92 39,65 39,65 C 37,55 32,32 32,32 Z" strokeWidth="1.5" className="text-muted-foreground/40" />
          <path d="M 32,32 L 24,56 L 20,75 M 68,32 L 76,56 L 80,75" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 44,92 L 42,115 L 42,146 M 56,92 L 58,115 L 58,146" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Head */}
          <g className="cursor-pointer group/zone" onClick={() => onSelectSymptom("I have high fever, headache and dry cough")}>
            <circle cx="50" cy="18" r="6" className="fill-red-500/20 stroke-red-500 animate-pulse hover:fill-red-500/40" strokeWidth="1.5" />
            <circle cx="50" cy="18" r="10" className="stroke-red-500/30 opacity-0 group-hover/zone:opacity-100 transition-opacity" strokeWidth="1" strokeDasharray="2,2" />
          </g>

          {/* Chest */}
          <g className="cursor-pointer group/zone" onClick={() => onSelectSymptom("I have chest tightness and pressure")}>
            <circle cx="50" cy="45" r="7" className="fill-pink-500/20 stroke-pink-500 animate-pulse hover:fill-pink-500/40" strokeWidth="1.5" />
            <circle cx="50" cy="45" r="12" className="stroke-pink-500/30 opacity-0 group-hover/zone:opacity-100 transition-opacity" strokeWidth="1" strokeDasharray="2,2" />
          </g>

          {/* Abdomen */}
          <g className="cursor-pointer group/zone" onClick={() => onSelectSymptom("I feel fatigue and noticed a new lump")}>
            <circle cx="50" cy="72" r="7" className="fill-amber-500/20 stroke-amber-500 animate-pulse hover:fill-amber-500/40" strokeWidth="1.5" />
            <circle cx="50" cy="72" r="12" className="stroke-amber-500/30 opacity-0 group-hover/zone:opacity-100 transition-opacity" strokeWidth="1" strokeDasharray="2,2" />
          </g>

          {/* Joints */}
          <g className="cursor-pointer group/zone" onClick={() => onSelectSymptom("My knees feel stiff and swell in the morning")}>
            <circle cx="42" cy="115" r="4.5" className="fill-cyan-500/20 stroke-cyan-500 animate-pulse hover:fill-cyan-500/40" strokeWidth="1.5" />
            <circle cx="58" cy="115" r="4.5" className="fill-cyan-500/20 stroke-cyan-500 animate-pulse hover:fill-cyan-500/40" strokeWidth="1.5" />
            <circle cx="50" cy="115" r="14" className="stroke-cyan-500/30 opacity-0 group-hover/zone:opacity-100 transition-opacity" strokeWidth="1" strokeDasharray="2,2" />
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border pt-3">
        <button onClick={() => onSelectSymptom("I have high fever, headache and dry cough")} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-left hover:bg-red-500/10 cursor-pointer">
          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
          <div>
            <span className="font-semibold text-foreground block">Head Zone</span>
            <span className="text-muted-foreground text-[9px]">Fever, Headache, Cough</span>
          </div>
        </button>
        <button onClick={() => onSelectSymptom("I have chest tightness and pressure")} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-pink-500/20 bg-pink-500/5 text-left hover:bg-pink-500/10 cursor-pointer">
          <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0" />
          <div>
            <span className="font-semibold text-foreground block">Chest Zone</span>
            <span className="text-muted-foreground text-[9px]">Chest pain, Tightness</span>
          </div>
        </button>
        <button onClick={() => onSelectSymptom("I feel fatigue and noticed a new lump")} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-left hover:bg-amber-500/10 cursor-pointer">
          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
          <div>
            <span className="font-semibold text-foreground block">Abdomen Zone</span>
            <span className="text-muted-foreground text-[9px]">Lump, Chronic fatigue</span>
          </div>
        </button>
        <button onClick={() => onSelectSymptom("My knees feel stiff and swell in the morning")} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-left hover:bg-cyan-500/10 cursor-pointer">
          <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
          <div>
            <span className="font-semibold text-foreground block">Joints / Knees</span>
            <span className="text-muted-foreground text-[9px]">Stiffness, Swelling</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AnatomicalBodyMap;
