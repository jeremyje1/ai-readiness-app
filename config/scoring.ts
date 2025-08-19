type Answer = {
  id: string;
  value: string | number;
};

export const weights = {
  redundancy: 0.4,
  aiReadiness: 0.35,
  savingsPotential: 0.25,
};

// Example formula implementations (you can refine these later)

export function computeRedundancy(answers: Answer[]): number {
  const relevant = answers.filter(a => a.id.startsWith("gov-") || a.id.startsWith("acad-") || a.id.startsWith("fin-"));
  if (relevant.length === 0) return 0;

  const score = relevant.reduce((sum, a) => sum + Number(a.value), 0);
  return Math.round((score / (relevant.length * 5)) * 100); // normalize to 100
}

export function computeAiReadiness(answers: Answer[]): number {
  const relevant = answers.filter(a => a.id.startsWith("it-") || a.id.startsWith("ir-") || a.id.includes("AI") || a.id.includes("chatbot"));
  if (relevant.length === 0) return 0;

  const score = relevant.reduce((sum, a) => sum + Number(a.value), 0);
  return Math.round((score / (relevant.length * 5)) * 100);
}

export function estimateSavings(answers: Answer[], budget: number): number {
  const duplicateRoles = answers.find(a => a.id === "acad-4")?.value || 0;
  const duplicateSystems = answers.find(a => a.id === "inst-5")?.value || 0;

  const avgSalary = 65000; // example estimate
  const duplicationCost = (Number(duplicateRoles) * avgSalary) + (Number(duplicateSystems) * 20000);
  const potentialSavings = duplicationCost * 0.45;

  return Math.min(Math.round(potentialSavings), Math.round(budget * 0.5));
}
