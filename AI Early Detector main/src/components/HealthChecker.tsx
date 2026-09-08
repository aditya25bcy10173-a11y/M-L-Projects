import { useState } from "react";
import { ArrowLeft, Volume2, Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2, MapPin, Phone, Globe, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { predict, MODEL_NAME, MODEL_ACCURACY, type MLPrediction } from "@/lib/mlModel";
import { generateFancyReport } from "@/lib/fancyReport";
import ModelExplainability from "@/components/ModelExplainability";
import { useLanguage } from "@/contexts/LanguageContext";
import { speakTextWithAdhiraVoice } from "@/lib/speech";

export interface CheckerQuestion {
  q: string;
  o: string[];
  r: number[];
}

interface HealthCheckerProps {
  title: string;
  reportTitle: string;
  reportSubtitle: string;
  reportFilename: string;
  hospitalKeyword: string;
  questions: CheckerQuestion[];
  weights: { bias: number; weights: number[] };
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distanceKm: number;
  phone?: string;
  website?: string;
  type?: string;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const HealthChecker = ({
  title,
  reportTitle,
  reportSubtitle,
  reportFilename,
  hospitalKeyword,
  questions,
  weights,
}: HealthCheckerProps) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [hospitalType, setHospitalType] = useState("all");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [selected, setSelected] = useState<Hospital | null>(null);

  const { t, language } = useLanguage();
  const currentQ = questions[index];

  const speak = (text: string) => {
    speakTextWithAdhiraVoice(text, language);
  };

  const handleAnswer = (n: number) => {
    if (predicting) return;
    const newAnswers = [...answers, currentQ.r[n]];
    setAnswers(newAnswers);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }
    setPredicting(true);
    // Defer compute so UI shows loading state
    setTimeout(() => {
      const result = predict(newAnswers, weights, questions.map((q) => q.q));
      setPrediction(result);
      setFinished(true);
      setPredicting(false);
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
        model: title,
      });
      localStorage.setItem("reports", JSON.stringify(reports));
    }, 600);
  };

  const downloadPDF = () => {
    if (!prediction) return;
    const doc = generateFancyReport({
      title: reportTitle,
      subtitle: reportSubtitle,
      prediction,
      questions,
      answers,
      modelName: MODEL_NAME,
      accuracy: MODEL_ACCURACY,
    });
    doc.save(reportFilename);
  };

  const findHospitals = () => {
    if (loadingHospitals) return;
    setHospitalError(null);
    setHospitals([]);
    setLoadingHospitals(true);

    if (!navigator.geolocation) {
      setHospitalError("Geolocation is not supported by your browser.");
      setLoadingHospitals(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserLoc({ lat, lon });
        try {
          // OpenStreetMap Overpass API — free, no key required
          const radius = 10000; // 10 km
          const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:${radius},${lat},${lon});
              way["amenity"="hospital"](around:${radius},${lat},${lon});
              relation["amenity"="hospital"](around:${radius},${lat},${lon});
            );
            out center tags 30;
          `;
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
          });
          if (!res.ok) throw new Error("Overpass request failed");
          const data = await res.json();

          let results: Hospital[] = (data.elements || [])
            .map((el: any): Hospital | null => {
              const t = el.tags || {};
              const elat = el.lat ?? el.center?.lat;
              const elon = el.lon ?? el.center?.lon;
              if (!elat || !elon) return null;
              const name = t.name || t["name:en"] || "Hospital";
              const addr = [t["addr:housenumber"], t["addr:street"], t["addr:city"], t["addr:postcode"]]
                .filter(Boolean)
                .join(", ");
              return {
                id: `${el.type}/${el.id}`,
                name,
                address: addr || "Address not available",
                lat: elat,
                lon: elon,
                distanceKm: haversine(lat, lon, elat, elon),
                phone: t.phone || t["contact:phone"],
                website: t.website || t["contact:website"],
                type: t.operator_type || (t.operator ? "operator: " + t.operator : undefined),
              };
            })
            .filter((h: Hospital | null): h is Hospital => !!h);

          if (hospitalType !== "all") {
            const want = hospitalType; // "government" | "private"
            results = results.filter((h) => {
              const blob = (h.type || "").toLowerCase();
              if (want === "government") return /gov|public|municipal|state/.test(blob);
              if (want === "private") return /private/.test(blob);
              return true;
            });
            // If filter eliminates everything, fall back to all
            if (results.length === 0) {
              results = (data.elements || [])
                .map((el: any): Hospital | null => {
                  const t = el.tags || {};
                  const elat = el.lat ?? el.center?.lat;
                  const elon = el.lon ?? el.center?.lon;
                  if (!elat || !elon) return null;
                  return {
                    id: `${el.type}/${el.id}`,
                    name: t.name || "Hospital",
                    address: [t["addr:street"], t["addr:city"]].filter(Boolean).join(", ") || "Address not available",
                    lat: elat,
                    lon: elon,
                    distanceKm: haversine(lat, lon, elat, elon),
                    phone: t.phone || t["contact:phone"],
                    website: t.website || t["contact:website"],
                  };
                })
                .filter((h: Hospital | null): h is Hospital => !!h);
            }
          }

          results.sort((a, b) => a.distanceKm - b.distanceKm);
          const top = results.slice(0, 8);
          setHospitals(top);
          setSelected(top[0] || null);
          if (results.length === 0) setHospitalError("No hospitals found nearby. Try a different filter.");
        } catch (e) {
          console.error(e);
          setHospitalError("Couldn't fetch nearby hospitals. Please try again.");
        } finally {
          setLoadingHospitals(false);
        }
      },
      (err) => {
        console.error(err);
        setHospitalError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable location access to find nearby hospitals."
            : "Couldn't get your location."
        );
        setLoadingHospitals(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const riskColor =
    prediction?.riskLevel === "High" ? "hsl(0, 84%, 60%)"
    : prediction?.riskLevel === "Moderate" ? "hsl(30, 95%, 53%)"
    : "hsl(160, 80%, 45%)";

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <ParticlesBackground />
      <div className="relative z-10 w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> {t("backHome")}
        </Link>

        <div className="rounded-2xl card-glow overflow-hidden bg-card">
          <div className="bg-hero-gradient p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Brain className="h-6 w-6 text-primary-foreground" />
              <h1 className="text-2xl font-bold text-primary-foreground">{title}</h1>
            </div>
            <p className="text-primary-foreground/70 text-sm">{MODEL_NAME} • Accuracy {MODEL_ACCURACY}</p>
          </div>

          {predicting ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-foreground font-semibold">{t("runningML")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("analyzingResponses")}</p>
            </div>
          ) : !finished ? (
            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{t("questionProgress")} {index + 1} {t("of")} {questions.length}</span>
                <span>{Math.round((index / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-6">
                <div className="h-full bg-hero-gradient rounded-full transition-all duration-500" style={{ width: `${(index / questions.length) * 100}%` }} />
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-4">Q{index + 1}. {t(currentQ.q)}</h2>

              <button onClick={() => speak(t(currentQ.q))} className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition mb-5">
                <Volume2 className="h-4 w-4 text-primary" /> {t("hearQuestion")}
              </button>

              <div className="flex flex-col gap-3">
                {currentQ.o.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={predicting} className="w-full py-3.5 rounded-xl bg-secondary border border-border text-foreground font-medium text-base hover:border-primary hover:bg-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t(opt)}
                  </button>
                ))}
              </div>
            </div>
          ) : prediction && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-5 text-center flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> {t("mlRisk")}
              </h2>

              <div className="w-full h-4 bg-secondary rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${prediction.riskScore}%`, background: riskColor }} />
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                {prediction.riskLevel === "High" ? <AlertTriangle className="h-5 w-5" style={{ color: riskColor }} /> : <CheckCircle className="h-5 w-5" style={{ color: riskColor }} />}
                <p className="text-lg font-bold" style={{ color: riskColor }}>{t(prediction.riskLevel)} Risk</p>
              </div>
              <p className="text-muted-foreground text-center text-sm mb-1">{t("probability")}: {(prediction.probability * 100).toFixed(2)}%</p>
              <p className="text-muted-foreground text-center text-sm mb-4">{t("modelConfidence")}: {prediction.confidence}%</p>

              {prediction.topFactors.length > 0 && (
                <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">{t("topRiskFactors")}</p>
                  <ul className="space-y-1">
                    {prediction.topFactors.map((f, i) => (
                      <li key={i} className="text-sm text-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" /> {t(f)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={downloadPDF} className="w-full py-3 mb-3 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition">
                {t("downloadReport")}
              </button>

              <select value={hospitalType} onChange={(e) => setHospitalType(e.target.value)} disabled={loadingHospitals} className="w-full p-3 mb-3 rounded-xl bg-secondary border border-border text-foreground disabled:opacity-50">
                <option value="all">{t("allHospitals")}</option>
                <option value="government">{t("govHospitals")}</option>
                <option value="private">{t("privateHospitals")}</option>
              </select>

              <button
                onClick={findHospitals}
                disabled={loadingHospitals}
                className="w-full py-3 mb-4 rounded-xl border border-primary bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingHospitals ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("locatingHospitals")}
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" /> {t("findHospitals")}
                  </>
                )}
              </button>

              {hospitalError && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-3">{hospitalError}</p>
              )}

              {loadingHospitals && (
                <div className="space-y-2 mb-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-secondary/60 border border-border animate-pulse" />
                  ))}
                </div>
              )}

              {selected && (() => {
                const d = 0.01;
                const bbox = `${selected.lon - d},${selected.lat - d},${selected.lon + d},${selected.lat + d}`;
                const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${selected.lat},${selected.lon}`;
                const fullMap = `https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lon}#map=17/${selected.lat}/${selected.lon}`;
                return (
                  <div className="rounded-xl overflow-hidden border border-border mb-3 bg-secondary">
                    <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">📍 {selected.name}</p>
                      <a href={fullMap} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline whitespace-nowrap">Open larger</a>
                    </div>
                    <iframe
                      key={selected.id}
                      title={`Map of ${selected.name}`}
                      src={embed}
                      className="w-full h-56 border-0"
                      loading="lazy"
                    />
                  </div>
                );
              })()}

              {hospitals.length > 0 && (
                <ul className="space-y-2">
                  {hospitals.map((h) => {
                    const gmaps = `https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`;
                    const directions = userLoc
                      ? `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lon}&destination=${h.lat},${h.lon}`
                      : gmaps;
                    const isActive = selected?.id === h.id;
                    return (
                      <li
                        key={h.id}
                        onClick={() => setSelected(h)}
                        className={`bg-secondary border p-3 rounded-xl text-left cursor-pointer transition ${isActive ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-primary/60"}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <b className="text-foreground leading-tight">{h.name}</b>
                          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                            {h.distanceKm.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm flex items-start gap-1.5 mb-2">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {h.address}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
                          {h.phone && (
                            <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                              <Phone className="h-3 w-3" /> {h.phone}
                            </a>
                          )}
                          {h.website && (
                            <a href={h.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                              <Globe className="h-3 w-3" /> Website
                            </a>
                          )}
                          <button onClick={() => setSelected(h)} className="inline-flex items-center gap-1 text-primary hover:underline">
                            <MapPin className="h-3 w-3" /> Preview Map
                          </button>
                          <a href={gmaps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <MapPin className="h-3 w-3" /> Google Maps
                          </a>
                          <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <Navigation className="h-3 w-3" /> Directions
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <ModelExplainability />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthChecker;
