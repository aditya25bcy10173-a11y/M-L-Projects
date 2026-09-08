import { Brain, ArrowRight } from "lucide-react";

const ModelExplainability = () => (
  <div className="bg-secondary/50 border border-border rounded-xl p-5 mt-5">
    <div className="flex items-center gap-2 mb-3">
      <Brain className="h-5 w-5 text-primary" />
      <p className="text-sm font-bold text-foreground uppercase tracking-wide">How the ML Model Works</p>
    </div>

    <div className="space-y-4 text-sm text-muted-foreground">
      {/* Pipeline */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20">Your Answers</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20">Feature Encoding</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20">Weighted Sum (z)</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20">Sigmoid σ(z)</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20">Risk %</span>
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <p>
          <strong className="text-foreground">Logistic Regression</strong> is a supervised ML algorithm that predicts binary outcomes (risk / no risk) by computing a weighted sum of input features and passing it through a <strong className="text-foreground">sigmoid function</strong>.
        </p>
        <p>
          Each question maps to a <strong className="text-foreground">feature</strong> with a pre-trained <strong className="text-foreground">weight</strong> reflecting its clinical importance. Higher weights mean that factor has more influence on the prediction.
        </p>
      </div>

      {/* Formula */}
      <div className="bg-card border border-border rounded-lg p-3 font-mono text-xs text-center">
        <p className="text-muted-foreground mb-1">Sigmoid Function</p>
        <p className="text-foreground text-sm">σ(z) = 1 / (1 + e<sup>−z</sup>)</p>
        <p className="text-muted-foreground mt-2 mb-1">Where</p>
        <p className="text-foreground text-sm">z = bias + Σ(w<sub>i</sub> × x<sub>i</sub>)</p>
      </div>

      {/* Key points */}
      <ul className="space-y-1.5">
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span><strong className="text-foreground">Confidence</strong> is based on distance from the decision boundary (0.5)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span><strong className="text-foreground">Top Factors</strong> show which answers contributed most to your score</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span>Output is a <strong className="text-foreground">probability (0–100%)</strong> mapped to Low / Moderate / High risk</span>
        </li>
      </ul>
    </div>
  </div>
);

export default ModelExplainability;
