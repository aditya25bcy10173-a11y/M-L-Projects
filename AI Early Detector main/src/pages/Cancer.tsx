import HealthChecker from "@/components/HealthChecker";
import { cancerWeights } from "@/lib/mlModel";

const questions = [
  { q: "Unexplained weight loss?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Persistent fatigue?", o: ["Daily", "Often", "Sometimes", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Any new lump or swelling?", o: ["Yes", "Unsure", "Rarely", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Smoking or tobacco use?", o: ["Regular", "Occasional", "Quit", "Never"], r: [1, 0.6, 0.3, 0] },
  { q: "Family history of cancer?", o: ["Close", "Distant", "Unsure", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Unusual bleeding?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Persistent cough >3 weeks?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Difficulty swallowing?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Bowel habit changes?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Skin mole changes?", o: ["Yes", "Unsure", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Regular cancer screening?", o: ["Never", "Irregular", "Sometimes", "Yes"], r: [1, 0.6, 0.3, 0] },
  { q: "Alcohol consumption?", o: ["High", "Moderate", "Low", "None"], r: [0.8, 0.6, 0.3, 0] },
  { q: "Night sweats/fever?", o: ["Often", "Sometimes", "Rare", "No"], r: [0.8, 0.6, 0.3, 0] },
  { q: "Age group?", o: ["60+", "50–60", "Below 50", "NA"], r: [1, 0.7, 0.4, 0] },
  { q: "Symptoms >3 months?", o: ["Yes", "Unsure", "Occasional", "No"], r: [1, 0.6, 0.3, 0] },
];

const Cancer = () => (
  <HealthChecker
    title="Cancer ML Screener"
    reportTitle="Cancer Risk Screening Report"
    reportSubtitle="AI-driven early detection assessment"
    reportFilename="Cancer_Risk_Report.pdf"
    hospitalKeyword="cancer hospital"
    questions={questions}
    weights={cancerWeights}
  />
);

export default Cancer;
