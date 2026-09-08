import HealthChecker from "@/components/HealthChecker";
import { aidsWeights } from "@/lib/mlModel";

const questions = [
  { q: "Unprotected sexual contact in past year?", o: ["Often", "Sometimes", "Rare", "Never"], r: [1, 0.7, 0.4, 0] },
  { q: "Multiple sexual partners?", o: ["Yes", "A few", "One", "None"], r: [1, 0.6, 0.3, 0] },
  { q: "Shared needles or syringes?", o: ["Yes", "Once", "Unsure", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Received blood transfusion (untested)?", o: ["Yes", "Unsure", "Long ago", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Persistent unexplained fever?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.7, 0.4, 0] },
  { q: "Rapid unexplained weight loss?", o: ["Yes", "Some", "Slight", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Recurrent infections (skin/mouth)?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Chronic diarrhea > 1 month?", o: ["Yes", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Swollen lymph nodes?", o: ["Yes", "Mild", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Night sweats?", o: ["Often", "Sometimes", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Tested for HIV before?", o: ["Never", "Long ago", "Recently", "Regularly"], r: [1, 0.6, 0.3, 0] },
  { q: "Partner HIV positive?", o: ["Yes", "Unsure", "Tested-No", "Single"], r: [1, 0.6, 0.3, 0] },
  { q: "STI history?", o: ["Multiple", "One", "Treated", "None"], r: [1, 0.6, 0.3, 0] },
  { q: "Tattoo/piercing with unsterile tools?", o: ["Yes", "Unsure", "Long ago", "No"], r: [1, 0.6, 0.3, 0] },
  { q: "Healthcare worker exposure?", o: ["Yes", "Possible", "Rare", "No"], r: [1, 0.6, 0.3, 0] },
];

const Aids = () => (
  <HealthChecker
    title="AIDS / HIV ML Screener"
    reportTitle="AIDS / HIV Risk Screening Report"
    reportSubtitle="AI-driven early detection assessment"
    reportFilename="AIDS_HIV_Risk_Report.pdf"
    hospitalKeyword="HIV AIDS clinic"
    questions={questions}
    weights={aidsWeights}
  />
);

export default Aids;
