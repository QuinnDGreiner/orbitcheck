const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface AnalyzeRequest {
  zip: string;
  areaType: string;
  wiredInternet: string;
  primaryUse: string;
  householdSize: string;
  budget: number;
  providers: string[];
}

export interface SubScores {
  locationScore: number;
  coverageScore: number;
  budgetScore: number;
  latencyScore: number;
}

export interface AnalyzeResponse {
  resultId: string;
  score: number;
  verdict: 'yes' | 'maybe' | 'no';
  verdictText: { headline: string; body: string };
  subScores: SubScores;
  compProviders: string[];
  bestLocalKey: string;
  pros: string[];
  cons: string[];
  coords: { lat: number; lon: number; region: string };
  shareUrl: string;
}

export async function analyze(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);
  return res.json();
}

export async function getResult(id: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE}/results/${id}`);
  if (!res.ok) throw new Error(`Result not found: ${res.status}`);
  return res.json();
}
