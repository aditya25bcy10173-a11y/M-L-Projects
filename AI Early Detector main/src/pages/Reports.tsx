import { useState } from "react";
import { ArrowLeft, FileText, Upload, Sparkles, Pill, AlertTriangle, Activity, Loader2, Stethoscope, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import ParticlesBackground from "@/components/ParticlesBackground";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface Analysis {
  summary: string;
  findings: string[];
  possibleConditions: { name: string; likelihood: string; rationale: string }[];
  prescription: { medicine: string; dosage: string; duration: string; purpose: string }[];
  lifestyle: string[];
  tests: string[];
  redFlags: string[];
  disclaimer: string;
}

const Reports = () => {
  const [reportText, setReportText] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setMimeType(f.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (f.type.startsWith("image/")) {
        setImageBase64(result.split(",")[1]);
        setReportText("");
      } else {
        setReportText(result);
        setImageBase64(null);
      }
    };
    if (f.type.startsWith("image/")) reader.readAsDataURL(f);
    else reader.readAsText(f);
  };

  const analyze = async () => {
    if (!reportText && !imageBase64) {
      toast.error("Please paste report text or upload a file/image.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-report", {
        body: { reportText, imageBase64, mimeType, patientNote },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as Analysis);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPrescription = () => {
    if (!result) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Branded header band + accent strip
    doc.setFillColor(13, 148, 136); // teal-600
    doc.rect(0, 0, w, 36, "F");
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.rect(0, 32, w, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AI Medical Prescription & Summary", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("AI Early Detector", 14, 26);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, w - 14, 18, { align: "right" });
    doc.text("Confidential Patient Document", w - 14, 25, { align: "right" });

    // Summary panel
    let y = 48;
    doc.setFillColor(245, 250, 248);
    doc.roundedRect(12, y, w - 24, 8, 2, 2, "F");
    doc.setTextColor(13, 148, 136);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CLINICAL SUMMARY", 16, y + 5.5);
    y += 14;

    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const sum = doc.splitTextToSize(result.summary || "—", w - 28);
    doc.text(sum, 14, y); y += sum.length * 5 + 4;

    const section = (title: string, items: string[]) => {
      if (!items?.length) return;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text(title, 14, y); y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      items.forEach((it) => {
        const t = doc.splitTextToSize(`• ${it}`, w - 28);
        if (y + t.length * 5 > 280) { doc.addPage(); y = 20; }
        doc.text(t, 16, y); y += t.length * 5 + 1;
      });
      y += 3;
    };

    section("Findings", result.findings || []);
    section("Possible Conditions", (result.possibleConditions || []).map(c => `${c.name} (${c.likelihood}) — ${c.rationale}`));

    if (result.prescription?.length) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(13, 148, 136);
      doc.text("Prescription (℞)", 14, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
      result.prescription.forEach((p, i) => {
        const t = doc.splitTextToSize(`${i + 1}. ${p.medicine} — ${p.dosage}, ${p.duration}. ${p.purpose}`, w - 28);
        if (y + t.length * 5 > 280) { doc.addPage(); y = 20; }
        doc.text(t, 16, y); y += t.length * 5 + 2;
      });
      y += 3;
    }

    section("Recommended Tests", result.tests || []);
    section("Lifestyle Advice", result.lifestyle || []);
    section("Red Flags", result.redFlags || []);

    // Branded footer on every page
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      const fy = h - 22;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, fy, w - 14, fy);
      doc.setFontSize(8); doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text(
        result.disclaimer || "Informational only. Not a substitute for professional medical advice.",
        14, fy + 6, { maxWidth: w - 60 }
      );
      doc.text(`Page ${p} of ${totalPages}`, w - 14, fy + 6, { align: "right" });
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.text("AI Early Detector", w / 2, fy + 16, { align: "center" });
    }

    doc.save(`AI_Prescription_${Date.now()}.pdf`);
    toast.success("Prescription PDF downloaded");
  };

  const likelihoodColor = (l: string) =>
    l === "High" ? "bg-destructive/10 text-destructive border-destructive/30"
    : l === "Moderate" ? "bg-orange-500/10 text-orange-600 border-orange-500/30"
    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";

  return (
    <div className="min-h-screen bg-background relative">
      <ParticlesBackground />
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Report Checker</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Upload or paste your medical report. Our AI will analyze it and generate a prescription with recommended next steps.
        </p>

        {/* Input card */}
        <div className="rounded-2xl bg-card card-glow p-6 mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">Paste report text</label>
          <textarea
            value={reportText}
            onChange={(e) => { setReportText(e.target.value); setImageBase64(null); setFileName(null); }}
            placeholder="e.g., Hemoglobin 9.2 g/dL, WBC 12,500, persistent cough for 3 weeks, mild fever..."
            className="w-full min-h-32 p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
          />

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
          </div>

          <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition">
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-sm text-foreground">
              {fileName ? `📎 ${fileName}` : "Upload report (image or .txt)"}
            </span>
            <input type="file" accept="image/*,.txt,.md" onChange={handleFile} className="hidden" />
          </label>

          <label className="block text-sm font-semibold text-foreground mt-4 mb-2">Patient note (optional)</label>
          <input
            value={patientNote}
            onChange={(e) => setPatientNote(e.target.value)}
            placeholder="Age, ongoing medications, allergies, main concern..."
            className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary"
          />

          <button
            onClick={analyze}
            disabled={loading}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Analyze with AI</>}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-card card-glow p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-primary" /> Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
            </div>

            {result.findings?.length > 0 && (
              <div className="rounded-2xl bg-card card-glow p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-primary" /> Key Findings
                </h2>
                <ul className="space-y-2">
                  {result.findings.map((f, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.possibleConditions?.length > 0 && (
              <div className="rounded-2xl bg-card card-glow p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Stethoscope className="h-5 w-5 text-primary" /> Possible Conditions
                </h2>
                <div className="grid gap-3">
                  {result.possibleConditions.map((c, i) => (
                    <div key={i} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">{c.name}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${likelihoodColor(c.likelihood)}`}>{c.likelihood}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.prescription?.length > 0 && (
              <div className="rounded-2xl bg-card card-glow p-6 border-2 border-primary/30">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Pill className="h-5 w-5 text-primary" /> Prescription (℞)
                </h2>
                <div className="space-y-3">
                  {result.prescription.map((p, i) => (
                    <div key={i} className="bg-secondary rounded-xl p-4">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{i + 1}. {p.medicine}</span>
                        <span className="text-xs text-muted-foreground">{p.duration}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1"><b>Dosage:</b> {p.dosage}</p>
                      <p className="text-sm text-muted-foreground mt-1">{p.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result.tests?.length > 0 || result.lifestyle?.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-6">
                {result.tests?.length > 0 && (
                  <div className="rounded-2xl bg-card card-glow p-6">
                    <h3 className="font-bold text-foreground mb-3">Recommended Tests</h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {result.tests.map((t, i) => <li key={i}>• {t}</li>)}
                    </ul>
                  </div>
                )}
                {result.lifestyle?.length > 0 && (
                  <div className="rounded-2xl bg-card card-glow p-6">
                    <h3 className="font-bold text-foreground mb-3">Lifestyle Advice</h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {result.lifestyle.map((t, i) => <li key={i}>• {t}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.redFlags?.length > 0 && (
              <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-6">
                <h3 className="font-bold text-destructive mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Red Flags — Seek Care
                </h3>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {result.redFlags.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/5 to-emerald-500/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-hero-gradient flex items-center justify-center text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Branded PDF Report</h3>
                  <p className="text-xs text-muted-foreground">AI prescription + clinical summary, ready to share with your doctor.</p>
                </div>
              </div>
              <button
                onClick={downloadPrescription}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-hero-gradient text-primary-foreground font-semibold hover:opacity-90 transition shadow-lg whitespace-nowrap"
              >
                <FileText className="h-4 w-4" /> Download PDF
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center italic">
              {result.disclaimer || "Informational only. Not a substitute for a licensed physician."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
