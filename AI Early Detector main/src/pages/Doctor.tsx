import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Phone, Search, Video, Star, MapPin, CheckCircle, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { toast } from "sonner";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  address: string;
  fee: string;
  available: boolean;
}

const mockDoctors: Doctor[] = [
  { id: "1", name: "Dr. Arvind Verma", specialty: "Cardiologist", rating: 4.9, experience: "15 yrs", address: "Max Hospital, New Delhi", fee: "$25", available: true },
  { id: "2", name: "Dr. Sarah D'Souza", specialty: "Oncologist", rating: 4.8, experience: "12 yrs", address: "Tata Memorial, Mumbai", fee: "$30", available: true },
  { id: "3", name: "Dr. Rajesh Gupta", specialty: "Pediatrician", rating: 4.7, experience: "10 yrs", address: "Apollo Clinic, Kolkata", fee: "$20", available: false },
  { id: "4", name: "Dr. Neha Sharma", specialty: "Gynecologist", rating: 4.9, experience: "14 yrs", address: "Fortis La Femme, Bangalore", fee: "$28", available: true },
  { id: "5", name: "Dr. Michael Carter", specialty: "General Physician", rating: 4.6, experience: "8 yrs", address: "Medanta Medicity, Gurugram", fee: "$18", available: true },
  { id: "6", name: "Dr. Amit Roy", specialty: "Cardiologist", rating: 4.8, experience: "16 yrs", address: "Escorts Heart Institute, Okhla", fee: "$30", available: true }
];

const Doctor = () => {
  // SOS States
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Search States
  const [searchSpecialty, setSearchSpecialty] = useState("All");
  const [zipCode, setZipCode] = useState("");
  const [filteredDocs, setFilteredDocs] = useState<Doctor[]>(mockDoctors);

  // SOS Countdown Timer
  useEffect(() => {
    if (!sosActive) return;
    if (sosCountdown <= 0) {
      setSosDispatched(true);
      toast.error("🚨 EMERGENCY DISPATCH ACTIVE: SOS message sent to family contacts, local ambulance, and nearest hospital.");
      setSosActive(false);
      return;
    }
    const timer = setTimeout(() => {
      setSosCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [sosActive, sosCountdown]);

  const triggerSOS = () => {
    setSosActive(true);
    setSosCountdown(5);
    setSosDispatched(false);
    toast.warning("SOS Countdown Started! Click Cancel within 5 seconds if accidental.");
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosCountdown(5);
    toast.info("SOS Alert Canceled.");
  };

  // Search Filter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let docs = mockDoctors;
    if (searchSpecialty !== "All") {
      docs = docs.filter(d => d.specialty === searchSpecialty);
    }
    setFilteredDocs(docs);
    toast.success(`Found ${docs.length} specialists!`);
  };

  const handleBook = (name: string) => {
    toast.success(`Booking request sent to ${name}. You will receive a video call confirmation link shortly! 📱`);
  };

  return (
    <div className={`min-h-screen bg-background relative pb-16 transition-colors duration-500 ${sosActive ? "bg-red-950/20" : ""}`}>
      <ParticlesBackground />
      
      {/* SOS Overlay Flash */}
      {sosActive && (
        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none z-[999]" />
      )}

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* SOS Panel */}
        <div className="rounded-2xl border-2 border-red-500/35 bg-card/90 shadow-2xl p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-br-xl">
            Emergency Service
          </div>
          
          <div className="max-w-md mx-auto py-4">
            <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-black text-foreground">🚨 RED ALERT SOS PORTAL</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Tap the button below to instantly trigger emergency dispatch, broadcast GPS location, and alert emergency contacts.
            </p>

            {/* Pulsing Button */}
            <div className="my-6 flex justify-center">
              {!sosActive && !sosDispatched && (
                <button
                  onClick={triggerSOS}
                  className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xl flex items-center justify-center shadow-xl shadow-red-500/25 active:scale-95 transition cursor-pointer animate-ping-slow border-4 border-red-500/40"
                >
                  SOS
                </button>
              )}

              {sosActive && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-red-600 text-white font-black text-4xl flex items-center justify-center border-4 border-white/40 animate-pulse">
                    {sosCountdown}s
                  </div>
                  <button onClick={cancelSOS} className="px-6 py-2 bg-secondary hover:bg-muted text-foreground font-bold rounded-xl text-xs transition cursor-pointer">
                    Cancel Trigger
                  </button>
                </div>
              )}

              {sosDispatched && (
                <div className="text-center">
                  <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold mb-3 flex items-center gap-2 justify-center">
                    <AlertTriangle className="h-4 w-4" /> Dispatched Successfully
                  </div>
                  <button onClick={() => setSosDispatched(false)} className="px-6 py-2 bg-secondary hover:bg-muted text-muted-foreground font-bold rounded-xl text-xs transition cursor-pointer">
                    Clear Alert
                  </button>
                </div>
              )}
            </div>

            {/* Direct Dial contacts */}
            <div className="flex justify-center gap-6 text-xs text-muted-foreground font-semibold">
              <a href="tel:102" className="flex items-center gap-1.5 hover:text-red-500 transition"><Phone className="h-4 w-4" /> Ambulance (102)</a>
              <a href="tel:100" className="flex items-center gap-1.5 hover:text-red-500 transition"><Phone className="h-4 w-4" /> Police (100)</a>
            </div>
          </div>
        </div>

        {/* Middle split sections */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Doctor Specialty Finder */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                👨‍⚕️ Doctor Specialty Finder
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Book immediate virtual consultations with expert doctors</p>

              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <select
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="All">All Specialties</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Oncologist">Oncologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="General Physician">General Physician</option>
                </select>

                <input
                  type="text"
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-24 p-2.5 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />

                <button type="submit" className="p-2.5 bg-primary text-primary-foreground rounded-xl text-xs hover:opacity-90 active:scale-95 transition cursor-pointer">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Doctors list */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border border-border/60 bg-secondary/10 hover:bg-secondary/20 transition flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">{doc.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{doc.specialty} • {doc.experience}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {doc.address}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-500" /> {doc.rating}
                        </span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                          Consult: {doc.fee}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(doc.name)}
                      disabled={!doc.available}
                      className={`py-2 px-3 rounded-lg text-[10px] font-bold shadow flex items-center gap-1 transition cursor-pointer ${
                        doc.available 
                          ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95" 
                          : "bg-secondary border text-muted-foreground opacity-55 cursor-not-allowed"
                      }`}
                    >
                      <Video className="h-3 w-3" /> {doc.available ? "Book Call" : "Offline"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CPR & First Aid Guide */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                🩹 First Aid & CPR instructions
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Immediate clinical directives for medical crises</p>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                {/* CPR */}
                <div className="p-3 bg-secondary/15 border border-border/60 rounded-xl">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Cardiopulmonary Resuscitation (CPR)
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    1. Place hands on center of chest. Push hard and fast at 100-120 compressions per minute.<br />
                    2. Maintain a depth of 2 inches (5cm) for adults.<br />
                    3. Perform 30 compressions followed by 2 rescue breaths. Continue until EMS arrives.
                  </p>
                </div>

                {/* Choking */}
                <div className="p-3 bg-secondary/15 border border-border/60 rounded-xl">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Choking (Heimlich Maneuver)
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    1. Stand behind the person. Wrap arms around waist.<br />
                    2. Make a fist with one hand. Place just above the bellybutton.<br />
                    3. Press hard into the abdomen with quick, upward thrusts. Repeat until object clears.
                  </p>
                </div>

                {/* Severe Bleeding */}
                <div className="p-3 bg-secondary/15 border border-border/60 rounded-xl">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Severe Hemorrhage / Bleeding
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    1. Apply direct firm pressure on the wound with a clean cloth/dressing.<br />
                    2. Keep the limb elevated above the heart level if possible.<br />
                    3. If bleeding continues, apply a tourniquet above the wound site and seek immediate care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby locator section */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-foreground mb-4">🏥 Emergency Contacts & Centers Finder</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-3.5 bg-secondary/10 border border-border/60 rounded-xl">
              <div className="text-xs font-bold text-foreground">🚑 24/7 Ambulance Dispatch</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Central Helpline: 102</div>
              <div className="text-[10px] text-primary font-bold mt-2 hover:underline"><a href="tel:102">Call Dispatch Now</a></div>
            </div>
            
            <div className="p-3.5 bg-secondary/10 border border-border/60 rounded-xl">
              <div className="text-xs font-bold text-foreground">🏥 Max Super Speciality</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Distance: 1.2 km away</div>
              <div className="text-[10px] text-primary font-bold mt-2">Emergency Unit: Open</div>
            </div>

            <div className="p-3.5 bg-secondary/10 border border-border/60 rounded-xl">
              <div className="text-xs font-bold text-foreground">💊 24h Apollo Pharmacy</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Distance: 0.8 km away</div>
              <div className="text-[10px] text-primary font-bold mt-2">Stock: Available</div>
            </div>

            <div className="p-3.5 bg-secondary/10 border border-border/60 rounded-xl">
              <div className="text-xs font-bold text-foreground">🩸 Red Cross Blood Bank</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Helpline: +91 99999 88888</div>
              <div className="text-[10px] text-primary font-bold mt-2 hover:underline"><a href="tel:+919999988888">Call Blood Bank</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctor;
