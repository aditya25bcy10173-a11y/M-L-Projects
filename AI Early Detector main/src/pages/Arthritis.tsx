import HealthChecker from "@/components/HealthChecker";
import { arthritisWeights } from "@/lib/mlModel";

const questions = [
  { q: "Do you experience joint pain regularly?", o: ["Daily", "Often", "Sometimes", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Do your joints feel stiff in the morning?", o: [">1 hour", "30–60 min", "Few minutes", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Do you hear cracking sounds in joints?", o: ["Often", "Sometimes", "Rarely", "No"], r: [0.8, 0.6, 0.3, 0] },
  { q: "Is there swelling in joints?", o: ["Severe", "Moderate", "Mild", "None"], r: [1, 0.7, 0.4, 0] },
  { q: "Do joints feel warm or red?", o: ["Often", "Sometimes", "Rarely", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Any difficulty walking or climbing stairs?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Does pain increase in cold weather?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [0.8, 0.6, 0.3, 0] },
  { q: "Do you feel joint weakness?", o: ["Often", "Sometimes", "Rarely", "No"], r: [0.8, 0.6, 0.3, 0] },
  { q: "Any family history of arthritis?", o: ["Yes", "Unsure", "Distant", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Do you have limited joint movement?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Do joints pain after rest?", o: ["Yes", "Sometimes", "Rarely", "No"], r: [0.9, 0.6, 0.3, 0] },
  { q: "Any joint deformity noticed?", o: ["Yes", "Unsure", "Rarely", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Are you overweight?", o: ["Yes", "Slightly", "No", "Healthy"], r: [0.8, 0.6, 0.3, 0] },
  { q: "Age above 45 years?", o: ["Above 60", "45–60", "Below 45", "Prefer not to say"], r: [1, 0.7, 0.4, 0] },
  { q: "Symptoms lasting more than 6 months?", o: ["Yes", "Unsure", "Occasional", "No"], r: [1, 0.6, 0.3, 0] },
];

const Arthritis = () => (
  <HealthChecker
    title="Arthritis ML Screener"
    reportTitle="Arthritis Risk Screening Report"
    reportSubtitle="AI-driven joint health assessment"
    reportFilename="Arthritis_Risk_Report.pdf"
    hospitalKeyword="orthopedic hospital"
    questions={questions}
    weights={arthritisWeights}
  />
);

export default Arthritis;
