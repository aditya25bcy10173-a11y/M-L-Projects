import HealthChecker from "@/components/HealthChecker";
import { covidWeights } from "@/lib/mlModel";

const questions = [
  { q: "Fever in last 7 days?", o: ["High", "Mild", "Brief", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Dry cough?", o: ["Persistent", "Often", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Shortness of breath?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Loss of taste or smell?", o: ["Yes", "Partial", "Unsure", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Sore throat?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Body aches / fatigue?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Headache?", o: ["Severe", "Moderate", "Mild", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Contact with COVID-positive person?", o: ["Confirmed", "Possible", "Unsure", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Recent travel to high-risk area?", o: ["Yes", "Possible", "Domestic", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Crowded indoor exposure?", o: ["Daily", "Often", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Vaccination status?", o: ["None", "1 dose", "2 doses", "Boosted"], r: [1, 0.6, 0.3, 0] },
  { q: "Chronic illness (diabetes/asthma)?", o: ["Multiple", "One", "Mild", "None"], r: [1, 0.6, 0.3, 0] },
  { q: "Diarrhea / GI symptoms?", o: ["Yes", "Sometimes", "Rare", "No"], r: [0.8, 0.5, 0.2, 0] },
  { q: "Age group?", o: ["60+", "40–60", "20–40", "<20"], r: [1, 0.6, 0.3, 0] },
  { q: "Symptoms duration?", o: [">7 days", "3–7 days", "1–3 days", "None"], r: [1, 0.7, 0.4, 0] },
];

const Covid = () => (
  <HealthChecker
    title="COVID-19 ML Screener"
    reportTitle="COVID-19 Risk Screening Report"
    reportSubtitle="AI-driven early detection assessment"
    reportFilename="COVID19_Risk_Report.pdf"
    hospitalKeyword="COVID testing hospital"
    questions={questions}
    weights={covidWeights}
  />
);

export default Covid;
