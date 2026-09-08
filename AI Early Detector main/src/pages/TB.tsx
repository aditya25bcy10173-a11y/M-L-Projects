import HealthChecker from "@/components/HealthChecker";
import { tbWeights } from "@/lib/mlModel";

const questions = [
  { q: "Persistent cough > 3 weeks?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Coughing up blood / sputum?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Chest pain when breathing/coughing?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Unexplained weight loss?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Night sweats?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Persistent low-grade fever?", o: ["Daily", "Often", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Loss of appetite?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Fatigue / weakness?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Close contact with TB patient?", o: ["Yes", "Possible", "Unsure", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Live in crowded conditions?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "HIV positive / immunocompromised?", o: ["Yes", "Possible", "Unsure", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Smoking?", o: ["Regular", "Occasional", "Quit", "Never"], r: [1, 0.6, 0.3, 0] },
  { q: "Diabetes?", o: ["Yes", "Pre-diabetic", "Borderline", "No"], r: [0.9, 0.6, 0.3, 0] },
  { q: "Recent travel to TB-endemic area?", o: ["Yes", "Possible", "Unsure", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Symptoms duration?", o: [">1 month", "2–4 weeks", "<2 weeks", "None"], r: [1, 0.7, 0.4, 0] },
];

const TB = () => (
  <HealthChecker
    title="Tuberculosis ML Screener"
    reportTitle="Tuberculosis Risk Screening Report"
    reportSubtitle="AI-driven early detection assessment"
    reportFilename="TB_Risk_Report.pdf"
    hospitalKeyword="tuberculosis TB hospital"
    questions={questions}
    weights={tbWeights}
  />
);

export default TB;
