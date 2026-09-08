import { jsPDF } from "jspdf";
import type { MLPrediction } from "./mlModel";

interface FancyReportOpts {
  title: string;
  subtitle: string;
  prediction: MLPrediction;
  questions: { q: string }[];
  answers: number[];
  modelName: string;
  accuracy: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
};

export function generateFancyReport(opts: FancyReportOpts) {
  const { title, subtitle, prediction, questions, answers, modelName, accuracy } = opts;
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  // ----- Header band -----
  const primary = hexToRgb("0d9488"); // teal-600
  const accent = hexToRgb("059669");  // emerald-600
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, w, 36, "F");
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 32, w, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitle, 14, 26);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, w - 14, 18, { align: "right" });
  doc.text(`AI Early Detector`, w - 14, 25, { align: "right" });

  // ----- Risk score panel -----
  let y = 48;
  doc.setFillColor(245, 250, 248);
  doc.roundedRect(12, y, w - 24, 38, 3, 3, "F");

  const riskColor: [number, number, number] =
    prediction.riskLevel === "High" ? [220, 38, 38]
    : prediction.riskLevel === "Moderate" ? [234, 88, 12]
    : [22, 163, 74];

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text("RISK PROBABILITY", 18, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...riskColor);
  doc.text(`${(prediction.probability * 100).toFixed(2)}%`, 18, y + 24);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text("RISK LEVEL", 18, y + 32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...riskColor);
  doc.text(prediction.riskLevel.toUpperCase(), 50, y + 32);

  // Confidence donut substitute - bar
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("MODEL CONFIDENCE", 110, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(13, 148, 136);
  doc.text(`${prediction.confidence}%`, 110, y + 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Model: ${modelName}`, 110, y + 30);
  doc.text(`Reported Accuracy: ${accuracy}`, 110, y + 35);

  // Risk meter bar
  y += 44;
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(14, y, w - 28, 6, 2, 2, "F");
  doc.setFillColor(...riskColor);
  const barW = ((w - 28) * Math.min(prediction.riskScore, 100)) / 100;
  doc.roundedRect(14, y, barW, 6, 2, 2, "F");

  // ----- Top contributing factors -----
  y += 16;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Top Contributing Factors", 14, y);
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.6);
  doc.line(14, y + 1.5, 80, y + 1.5);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  if (prediction.topFactors.length === 0) {
    doc.text("• No high-impact factors identified.", 18, y);
    y += 6;
  } else {
    prediction.topFactors.forEach((f, i) => {
      doc.setFillColor(13, 148, 136);
      doc.circle(17, y - 1.5, 1.4, "F");
      doc.text(`${i + 1}. ${f}`, 22, y);
      y += 7;
    });
  }

  // ----- Symptom answers table -----
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Symptom Assessment Summary", 14, y);
  doc.line(14, y + 1.5, 95, y + 1.5);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  questions.forEach((q, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const a = answers[i] ?? 0;
    const sev = a >= 0.8 ? "High" : a >= 0.5 ? "Moderate" : a > 0 ? "Low" : "None";
    const sevColor: [number, number, number] = a >= 0.8 ? [220, 38, 38] : a >= 0.5 ? [234, 88, 12] : a > 0 ? [202, 138, 4] : [22, 163, 74];
    const text = doc.splitTextToSize(`${i + 1}. ${q.q}`, w - 50);
    doc.setTextColor(40, 40, 40);
    doc.text(text, 16, y);
    doc.setTextColor(...sevColor);
    doc.setFont("helvetica", "bold");
    doc.text(sev, w - 18, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += text.length * 4.5 + 2;
  });

  // ----- Recommendations -----
  if (y > 240) { doc.addPage(); y = 20; }
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Recommendations", 14, y);
  doc.line(14, y + 1.5, 65, y + 1.5);
  y += 8;

  const recs = prediction.riskLevel === "High"
    ? ["Schedule a consultation with a specialist within 1–2 weeks.",
       "Request relevant diagnostic tests (imaging, blood panel).",
       "Avoid self-medication; share this report with your physician."]
    : prediction.riskLevel === "Moderate"
    ? ["Book a routine checkup in the next 4–6 weeks.",
       "Track symptoms in a daily journal for 2 weeks.",
       "Adopt healthier diet and exercise routines."]
    : ["Continue regular preventive screenings.",
       "Maintain a balanced diet, exercise, and sleep schedule.",
       "Re-screen using this tool every 6 months."];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  recs.forEach((r) => {
    const t = doc.splitTextToSize(`• ${r}`, w - 30);
    doc.text(t, 18, y);
    y += t.length * 5 + 1;
  });

  // ----- Footer / disclaimer -----
  y = doc.internal.pageSize.getHeight() - 22;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, w - 14, y);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Disclaimer: This report is generated by an AI screening model for informational purposes only and does NOT constitute a medical diagnosis. Always consult a qualified healthcare professional.",
    14, y + 6, { maxWidth: w - 28 }
  );
  doc.setTextColor(13, 148, 136);
  doc.text("AI Early Detector", w / 2, y + 18, { align: "center" });

  return doc;
}
