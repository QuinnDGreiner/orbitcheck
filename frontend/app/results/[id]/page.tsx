'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResult, type AnalyzeResponse } from '@/lib/api';
import { PROVIDERS } from '@/lib/data';
import ScoreGauge from '@/components/ScoreGauge';
import ProviderCard from '@/components/ProviderCard';
import ComparisonTable from '@/components/ComparisonTable';
import dynamic from 'next/dynamic';

// Load OrbitMap without SSR (Leaflet requires window)
const OrbitMap = dynamic(() => import('@/components/OrbitMap'), { ssr: false });

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState('');
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getResult(id)
      .then(setData)
      .catch(() => setError('Result not found or expired.'));
  }, [id]);

  // Re-run scroll reveal on results elements after async data loads
  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);

  // Animate sub-score bars after data loads
  useEffect(() => {
    if (!data || !barsRef.current) return;
    setTimeout(() => {
      barsRef.current?.querySelectorAll<HTMLElement>('.sub-score-fill').forEach(el => {
        el.style.width = el.dataset.w + '%';
      });
    }, 300);
  }, [data]);

  if (error) {
    return (
      <section style={{ padding: '120px 40px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: '32px' }} onClick={() => router.push('/tool')}>
          Start Over
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section id="loading">
        <div className="loading-title">Loading<br />Your Results</div>
        <div className="spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
      </section>
    );
  }

  const bestLocal = PROVIDERS[data.bestLocalKey];
  const starlink = PROVIDERS['starlink'];
  const costDiff = starlink.price - bestLocal.price;
  const localCards = data.compProviders.filter(k => k !== 'starlink').slice(0, 3);

  const verdictLabel =
    data.verdict === 'yes' ? 'Recommended' :
    data.verdict === 'maybe' ? 'Consider It' : 'Not Recommended';

  const recTitle =
    data.verdict === 'yes' ? 'Ready to Switch?' :
    data.verdict === 'maybe' ? 'Do Your Research' : 'Stay Grounded';

  const recBody =
    data.verdict === 'yes'
      ? `With a score of ${data.score}/100, your situation aligns well with what Starlink offers. Order directly from starlink.com with free returns in 30 days if it doesn't work out.`
      : data.verdict === 'maybe'
      ? `Your score of ${data.score}/100 suggests running a speed test on your current connection and comparing real-world performance before committing to satellite hardware.`
      : `Your score of ${data.score}/100 means local options are likely a better fit. Use the FCC Broadband Map to verify all providers in your area.`;

  return (
    <>
      <nav>
        <a href="/" className="nav-logo">OrbitCheck</a>
        <ul className="nav-links">
          <li><a href="/#how-it-works">How It Works</a></li>
          <li><a href="/tool">Run Check</a></li>
          <li><a href="https://broadbandmap.fcc.gov/" target="_blank" rel="noopener noreferrer">FCC Map</a></li>
        </ul>
      </nav>

      <section id="results">

        {/* Score Header */}
        <div className="results-score-header reveal">
          <p className="score-eyebrow">
            Starlink Suitability Score — {data.coords.region}
          </p>
          <ScoreGauge target={data.score} />
          <p className="score-label">out of 100</p>
        </div>

        {/* Verdict */}
        <div className="verdict-section">
          <div className="verdict-left reveal">
            <span className={`verdict-tag ${data.verdict}`}>{verdictLabel}</span>
            <h2 className="verdict-headline">{data.verdictText.headline}</h2>
            <p className="verdict-body">{data.verdictText.body}</p>
          </div>
          <div className="verdict-right reveal" ref={barsRef}>
            {[
              { label: 'Location Factor', key: 'locationScore' },
              { label: 'Coverage Gap',    key: 'coverageScore' },
              { label: 'Budget Match',    key: 'budgetScore' },
              { label: 'Use Case Fit',   key: 'latencyScore' },
            ].map(({ label, key }) => {
              const val = data.subScores[key as keyof typeof data.subScores];
              return (
                <div key={key} className="sub-score-row">
                  <div className="sub-score-label">
                    <span>{label}</span><span>{val}</span>
                  </div>
                  <div className="sub-score-bar">
                    <div className="sub-score-fill" data-w={val} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provider Spotlight */}
        <div className="provider-spotlight reveal">
          <div>
            <p className="spotlight-label">Best Local Alternative</p>
            <p className="spotlight-name">{bestLocal.name}</p>
            <p className="spotlight-detail">
              {bestLocal.speedLabel} &nbsp;·&nbsp; {bestLocal.latencyLabel} latency &nbsp;·&nbsp; {bestLocal.reliability}% reliability<br />
              {bestLocal.contract ? 'Contract required' : 'No contract'}
              {bestLocal.equipment ? ` · $${bestLocal.equipment} equipment fee` : ''}
            </p>
          </div>
          <div className="cost-diff">
            <p className="cost-diff-label">vs. Starlink $120/mo</p>
            <div className="cost-diff-value">{costDiff >= 0 ? '+' : ''}${costDiff}</div>
            <p className="cost-diff-sub">
              {costDiff > 0 ? 'Starlink costs more' : costDiff < 0 ? 'Starlink costs less' : 'Same price'}
            </p>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="provider-cards-section reveal">
          <h3 className="results-section-title">Provider Breakdown</h3>
          <div className="provider-results-grid">
            {localCards.map(key => <ProviderCard key={key} providerKey={key} />)}
            <ProviderCard providerKey="starlink" isStarlink />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="comparison-section reveal">
          <h3 className="results-section-title">Full Comparison</h3>
          <ComparisonTable compProviders={data.compProviders} />
        </div>

        {/* Key Factors */}
        <div className="factors-section reveal">
          <h3 className="results-section-title">Key Factors</h3>
          <div className="pros-cons-grid">
            <div>
              <p className="pros-cons-label pro">For Starlink</p>
              <ul className="pros-list">
                {data.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div>
              <p className="pros-cons-label con">Against Starlink</p>
              <ul className="cons-list">
                {data.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Coverage Map */}
        <div className="map-section reveal">
          <h3 className="results-section-title">Coverage Map</h3>
          <OrbitMap coords={data.coords} compProviders={data.compProviders} />
        </div>

        {/* Methodology */}
        <div className="methodology-section">
          <p className="methodology-text">
            Scoring uses 6 weighted factors: location type, existing connectivity, local provider quality,
            budget alignment, use-case latency sensitivity, and household size. Provider data sourced from
            FCC Broadband Map, public speed test aggregates, and ISP published pricing as of early 2025.
            Reliability scores are derived from aggregated consumer reports. &nbsp;
            <a href="https://broadbandmap.fcc.gov/" target="_blank" rel="noopener noreferrer">
              View FCC Broadband Map &rarr;
            </a>
          </p>
        </div>

        {/* Recommendation */}
        <div className="recommendation-section">
          <h2 className="rec-title">{recTitle}</h2>
          <p className="rec-body">{recBody}</p>
          <div className="rec-actions">
            <button className="btn btn-dark" onClick={() => router.push('/tool')}>Start Over</button>
            <a
              href="https://broadbandmap.fcc.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-dark"
            >
              FCC Broadband Map
            </a>
          </div>
        </div>

      </section>

      <footer>
        <div className="footer-logo">OrbitCheck</div>
        <p className="footer-text">
          Data sourced from FCC, provider websites, and public speed test aggregates.
          Not affiliated with Starlink or SpaceX.
        </p>
      </footer>
    </>
  );
}
