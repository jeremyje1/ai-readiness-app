# Algorithm Validation & Upgrade – Version 2.1  
### NorthPath Strategies · 2025‑07‑04

---

## 0 · Why this document exists
1. **Visibility** – Stakeholders need to see *how* scores are produced.  
2. **Auditability** – Code and math must survive external review (SOC‑2, client CIOs).  
3. **Extensibility** – The algorithm has to *grow* as we ingest more data.

---

## 1 · Current‑State Checklist

| Item | Validation Step | Expected Result |
|------|-----------------|-----------------|
| `lib/algorithm/score.ts` present? | `ls lib/algorithm` | File exists. |
| Unit tests for algorithm? | `pnpm test --filter score` | Pass or fail. |
| API computes score? | `curl -X POST /api/assessment/submit …` | `{score: …, tier: …}` JSON. |
| Explainability in results UI? | Visual | Table or chart that shows factor weights. |

> **❗ If any box is unchecked, treat the algorithm as *missing* and proceed to Section 3.**

---

## 2 · Algorithm v1 Recap (if present)

```ts
// v1 – flat weights
score = 0.25*spanControl + 0.25*culture + 0.20*techFit + 0.30*readiness
```

---

## 3 · Algorithm v2.1 – Specification
### 3.1 Inputs
| Key | Type | Description |
|-----|------|-------------|
| answers | Record<string, number> | Normalised 0‑4 Likert per item. |
| segment | 'HIGHER_ED' | 'NON_PROFIT' | 'HEALTHCARE' … | Industry selector. |
| confidencePenalty | number | –0.05 per mandatory item left blank. |

### 3.2 Weights by Segment
```ts
const SEGMENT_WEIGHTS: Record<Segment, FactorWeight> = {
  HIGHER_ED : { spanControl:0.25, culture:0.25, techFit:0.20, readiness:0.30 },
  NON_PROFIT: { spanControl:0.20, culture:0.30, techFit:0.20, readiness:0.30 },
  HEALTHCARE: { spanControl:0.30, culture:0.20, techFit:0.25, readiness:0.25 },
};
```

### 3.3 Computation
```ts
export async function calcScoreV21(input: AlgoInput): Promise<AlgoOutput> {
  const { answers, segment } = input;
  const w  = SEGMENT_WEIGHTS[segment];
  const n  = normaliseLikert(answers);           // 0‑1 each
  const base = w.spanControl*n.spanControl +
               w.culture    *n.culture     +
               w.techFit    *n.techFit     +
               w.readiness  *n.readiness;

  const blanks = countBlanks(answers);           // mandatory q’s only
  const penalty = blanks * 0.05;
  const score   = Math.max(0, base - penalty);

  const tier = score >= 0.75 ? 'Implementation Support'
            : score >= 0.50 ? 'Transformation Planning'
            :                 'Strategic Assessment';

  const ci   = calcConfidenceInterval(n, blanks);   // simple ± value

  const peer = await getPeerPercentile(segment, score); // Supabase RPC

  return { score, tier, ci, peerPercentile: peer };
}
```

### 3.4 Output contract
```ts
interface AlgoOutput {
  score          : number;   // 0‑1
  tier           : 'Strategic Assessment' | 'Transformation Planning' | 'Implementation Support';
  ci             : number;   // ± value
  peerPercentile : number;   // 0‑100
}
```

---

## 4 · Worked Example – “Example Community College”
| Factor | Raw Likert (0–4) | Normalised (÷4) | Weight | Weighted |
|--------|------------------|-----------------|--------|----------|
| Span‑of‑Control | 2 | 0.50 | 0.25 | 0.125 |
| Culture | 3 | 0.75 | 0.25 | 0.188 |
| Tech‑Fit | 2.5 | 0.625 | 0.20 | 0.125 |
| Readiness | 3 | 0.75 | 0.30 | 0.225 |
| **Subtotal** | | | | **0.663** |
| Missing answers | 1 mandatory | –0.05 per | | –0.05 |
| **Final Score** | | | | **0.613** |

Tier: Transformation Planning  
Confidence Interval: ± 0.04  
Peer Percentile (Higher‑Ed): ~68ᵗʰ

(These numbers match the sample PDF you already have.)

---

## 5 · Automated Test Harness
### 5.1 Unit Tests (Vitest)
```ts
import { calcScoreV21 } from '@/lib/algorithm/v2.1';

test('calculates correct score for sample data', async () => {
  const { score, tier } = await calcScoreV21({
    segment : 'HIGHER_ED',
    answers : sampleAnswers,          // fixtures/sampleHigherEd.json
  });
  expect(score).toBeCloseTo(0.613, 3);
  expect(tier).toBe('Transformation Planning');
});
```
### 5.2 Golden‑Dataset Regression
- Create `/fixtures/` with anonymised historical assessments (`*.json`).
- Snapshot expected output in `/__snapshots__/`.
- CI step—`vitest --run --coverage`—fails if algorithm drift ≥ ±0.02 unless intentionally updated.

### 5.3 Integration (TRPC + API)
- Use supertest to POST to `/api/assessment/submit` with the same fixture; assert identical response.

---

## 6 · Validating the AI Narrative Layer
The result‑screen uses an LLM prompt like:

```java
You are an organizational‑change analyst…
Summarise strengths (score ≥ peer + 0.05) and weaknesses…
```
Add playwright e2e test:
- Seed database with sampleAnswers.
- Visit `/assessment/results?id=…`.
- Scrape text and assert it contains “data‑governance” (known weakness) and “change‑management” (known strength).
- For deeper validation, log the prompt + completion to BigQuery, then periodically human‑rate 5 % of narratives (⭐ 1–5). Flag ≤ 3⭐ for prompt‑engineering review.

---

## 7 · Next‑Level Enhancements
| Feature | Benefit | ETA |
|---------|---------|-----|
| Gradient‑Boosted ML overlay (XGBoost) | Learns non‑linear impact from growing dataset. | Q4‑2025 |
| Shapley‑value explainability | Pinpoint per‑question contribution. | Q1‑2026 |
| Auto‑tuning weights (Bayesian optimisation) | Continuous improvement without manual retuning. | Q2‑2026 |

---

## 8 · Definition of “Done”
- All tests in Section 5 pass in CI.
- Result page shows CI and peer percentile.
- Sample report PDF matches Section 4 numbers.
- README updated with “Algorithm v2.1” badge.

© 2025 NorthPath Strategies · Confidential & Proprietary