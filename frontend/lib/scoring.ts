import { PROVIDERS, ZIP_COORDS, PREFIX_COORDS, type Coords } from './data';

export interface FormState {
  zip: string;
  areaType: 'urban' | 'suburban' | 'rural' | 'remote' | '';
  wiredInternet: 'none' | 'dsl' | 'fixedWireless' | 'cable' | 'fiber' | '';
  primaryUse: 'browsing' | 'streaming' | 'work' | 'gaming' | 'mixed' | '';
  householdSize: 'solo' | 'small' | 'medium' | 'large' | '';
  budget: number;
  providers: string[];
}

export interface SubScores {
  locationScore: number;
  coverageScore: number;
  budgetScore: number;
  latencyScore: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function computeScore(s: FormState): number {
  let score = 50;

  if (s.areaType === 'remote')   score += 30;
  else if (s.areaType === 'rural')    score += 20;
  else if (s.areaType === 'urban')    score -= 20;

  if (s.wiredInternet === 'none')          score += 30;
  else if (s.wiredInternet === 'dsl')           score += 18;
  else if (s.wiredInternet === 'fixedWireless') score += 8;
  else if (s.wiredInternet === 'cable')         score -= 8;
  else if (s.wiredInternet === 'fiber')         score -= 28;

  const fiberISPs = ['att-fiber', 'verizon-fios', 'frontier-fiber'];
  const cableISPs = ['comcast', 'spectrum', 'cox', 'mediacom'];
  const geoISPs   = ['hughesnet', 'viasat'];
  if (s.providers.some(p => fiberISPs.includes(p))) score -= 20;
  else if (s.providers.some(p => cableISPs.includes(p))) score -= 8;
  if (s.providers.some(p => geoISPs.includes(p))) score += 10;
  if (s.providers.length === 0) score += 12;

  if (s.budget >= 130)      score += 10;
  else if (s.budget >= 100) score += 4;
  else if (s.budget < 60)   score -= 20;
  else if (s.budget < 80)   score -= 12;

  if (s.primaryUse === 'gaming')    score -= 12;
  else if (s.primaryUse === 'work') score -= 4;
  else if (s.primaryUse === 'streaming') score += 2;
  else if (s.primaryUse === 'browsing')  score += 6;
  else if (s.primaryUse === 'mixed')     score -= 2;

  if (s.householdSize === 'small')  score += 4;
  else if (s.householdSize === 'solo')  score += 2;
  else if (s.householdSize === 'medium') score += 2;
  else if (s.householdSize === 'large')  score -= 2;

  return clamp(score, 0, 100);
}

export function computeSubScores(s: FormState): SubScores {
  const locationScore = ({ remote: 95, rural: 75, suburban: 45, urban: 15 } as Record<string, number>)[s.areaType] ?? 50;
  const coverageScore = ({ none: 95, dsl: 75, fixedWireless: 55, cable: 30, fiber: 10 } as Record<string, number>)[s.wiredInternet] ?? 50;
  const budgetScore   = s.budget >= 130 ? 90 : s.budget >= 100 ? 70 : s.budget >= 80 ? 50 : s.budget >= 60 ? 35 : 15;
  const latencyScore  = ({ browsing: 90, streaming: 80, mixed: 60, work: 40, gaming: 15 } as Record<string, number>)[s.primaryUse] ?? 60;
  return { locationScore, coverageScore, budgetScore, latencyScore };
}

export function getVerdict(score: number): 'yes' | 'maybe' | 'no' {
  if (score >= 62) return 'yes';
  if (score >= 38) return 'maybe';
  return 'no';
}

export function getVerdictText(verdict: string, score: number): { headline: string; body: string } {
  if (verdict === 'yes') return {
    headline: 'Starlink is a Strong Fit',
    body: `Your situation scores ${score}/100 for Starlink suitability. Limited local competition, your location type, and budget alignment make satellite internet a compelling choice.`,
  };
  if (verdict === 'maybe') return {
    headline: 'Starlink Could Work',
    body: `Your score of ${score}/100 puts you in the "consider it" zone. Starlink may offer value depending on how your local providers perform in practice. Compare carefully before committing.`,
  };
  return {
    headline: 'Stick With Your ISP',
    body: `At ${score}/100, your existing or available options likely outperform Starlink for your specific needs. Faster speeds, lower latency, and better pricing are available locally.`,
  };
}

export function generatePros(s: FormState): string[] {
  const pros: string[] = [];
  if (s.areaType === 'remote') pros.push('Remote location — satellite is often the only viable option');
  if (s.areaType === 'rural') pros.push('Rural area with limited wired infrastructure');
  if (s.wiredInternet === 'none') pros.push('No wired alternative available in your area');
  if (s.wiredInternet === 'dsl') pros.push('DSL is slow and aging — Starlink offers far more speed');
  if (['hughesnet', 'viasat'].some(p => s.providers.includes(p))) pros.push('Current geo-satellite option is much slower with higher latency');
  if (s.budget >= 120) pros.push("Budget comfortably covers Starlink's $120/mo plan");
  if (s.primaryUse === 'browsing') pros.push('Light browsing use case is well-suited for satellite latency');
  else if (s.primaryUse === 'streaming') pros.push('Streaming use case is well-suited for satellite latency');
  if (s.providers.length === 0) pros.push('No identified local providers — Starlink fills a real gap');
  if (pros.length === 0) pros.push('Nationwide coverage regardless of location');
  pros.push('No contract, easy to cancel');
  return pros.slice(0, 5);
}

export function generateCons(s: FormState): string[] {
  const cons: string[] = [];
  if (s.areaType === 'urban') cons.push('Urban area has abundant wired competition');
  if (s.wiredInternet === 'fiber') cons.push('Fiber optic available — offers lower latency and higher speeds');
  if (s.wiredInternet === 'cable') cons.push('Cable internet provides comparable speeds at lower cost');
  if (s.primaryUse === 'gaming') cons.push('20–60ms satellite latency harms online gaming performance');
  if (s.primaryUse === 'work') cons.push('Video calls and VPNs benefit from sub-20ms latency');
  if (s.budget < 100) cons.push(`Budget of $${s.budget}/mo is below Starlink's $120 starting price`);
  if (s.householdSize === 'large') cons.push('Large households risk congestion during peak usage');
  if (s.providers.some(p => ['att-fiber', 'verizon-fios', 'frontier-fiber'].includes(p))) cons.push('High-reliability fiber providers available in your area');
  cons.push('$599 hardware cost required upfront');
  if (cons.length < 3) cons.push('Performance can vary during storms or peak congestion');
  return cons.slice(0, 5);
}

export function getBestLocalProvider(s: FormState): string {
  const selected = s.providers.filter(k => k !== 'starlink');
  if (selected.length > 0) {
    return selected.reduce((best, k) => PROVIDERS[k].reliability > PROVIDERS[best].reliability ? k : best, selected[0]);
  }
  const defaults: Record<string, string> = { urban: 'comcast', suburban: 'spectrum', rural: 'att-dsl', remote: 'viasat' };
  return defaults[s.areaType] || 'comcast';
}

export function getComparisonProviders(s: FormState): string[] {
  const selected = s.providers.filter(k => k !== 'starlink');
  const areaDefaults: Record<string, string[]> = {
    urban:    ['comcast', 'att-fiber'],
    suburban: ['spectrum', 'tmobile-home'],
    rural:    ['att-dsl', 'frontier-dsl'],
    remote:   ['hughesnet', 'viasat'],
  };
  const defaults = areaDefaults[s.areaType] ?? ['comcast', 'spectrum'];
  return [...new Set([...selected, ...defaults, 'starlink'])].slice(0, 6);
}

export function providerValueScore(key: string): number {
  const p = PROVIDERS[key];
  const speedScore = Math.min(100, (Math.log(p.maxSpeed + 1) / Math.log(5001)) * 100);
  const latScore   = Math.max(0, 100 - (p.latencyMs / 800) * 100);
  const priceScore = Math.max(0, 100 - ((p.price - 30) / 220) * 100);
  const relScore   = p.reliability;
  return Math.round(speedScore * 0.3 + latScore * 0.3 + priceScore * 0.2 + relScore * 0.2);
}

export function resolveCoords(zip: string): Coords {
  if (zip && ZIP_COORDS[zip]) return ZIP_COORDS[zip];
  if (zip && zip.length >= 3) {
    const prefix = zip.substring(0, 3);
    if (PREFIX_COORDS[prefix]) return PREFIX_COORDS[prefix];
    for (const [k, v] of Object.entries(PREFIX_COORDS)) {
      if (k.startsWith(zip.substring(0, 2))) return v;
    }
  }
  return { lat: 39.5, lon: -98.35, region: 'United States' };
}
