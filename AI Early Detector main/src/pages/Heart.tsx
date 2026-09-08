import HealthChecker from "@/components/HealthChecker";
import { heartWeights } from "@/lib/mlModel";

const questions = [
  { q: "Chest pain or pressure?", o: ["Frequent", "Sometimes", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Pain radiating to arm/jaw/back?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Shortness of breath on activity?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "High blood pressure?", o: ["Uncontrolled", "Controlled", "Borderline", "Normal"], r: [1, 0.7, 0.4, 0] },
  { q: "High cholesterol?", o: ["High", "Borderline", "Mild", "Normal"], r: [1, 0.7, 0.4, 0] },
  { q: "Diabetes?", o: ["Type 1/2", "Pre-diabetic", "Borderline", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Smoking?", o: ["Regular", "Occasional", "Quit", "Never"], r: [1, 0.6, 0.3, 0] },
  { q: "Family history of heart disease?", o: ["Close", "Distant", "Unsure", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Obesity / high BMI?", o: ["High", "Overweight", "Borderline", "Normal"], r: [1, 0.6, 0.3, 0] },
  { q: "Sedentary lifestyle?", o: ["Always", "Often", "Sometimes", "Active"], r: [1, 0.6, 0.3, 0] },
  { q: "Frequent palpitations?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Cold sweats / nausea?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Stress level?", o: ["Very high", "High", "Moderate", "Low"], r: [0.9, 0.6, 0.3, 0] },
  { q: "Age group?", o: ["60+", "45–60", "30–45", "<30"], r: [1, 0.7, 0.4, 0] },
  { q: "Previous heart event/surgery?", o: ["Yes", "Possible", "Unsure", "No"], r: [1, 0.7, 0.4, 0] },
];

const Heart = () => (
  <HealthChecker
    title="Heart Attack ML Screener"
    reportTitle="Heart Attack Risk Screening Report"
    reportSubtitle="AI-driven cardiovascular risk assessment"
    reportFilename="Heart_Attack_Risk_Report.pdf"
    hospitalKeyword="cardiology hospital"
    questions={questions}
    weights={heartWeights}
  />
);

export default Heart;
