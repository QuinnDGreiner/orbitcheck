import Link from 'next/link';

export default function Home() {
  return (
    <>
      <nav>
        <a href="/" className="nav-logo">OrbitCheck</a>
        <ul className="nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><Link href="/tool">Run Check</Link></li>
          <li><a href="https://broadbandmap.fcc.gov/" target="_blank" rel="noopener noreferrer">FCC Map</a></li>
        </ul>
      </nav>

      <section id="hero">
        <div className="orbit-container">
          <div className="ring" />
          <div className="ring" />
          <div className="ring" />
        </div>
        <div className="hero-content reveal">
          <p className="hero-eyebrow">Satellite vs. Ground — Decided by Data</p>
          <h1 className="hero-title">Is Starlink<br />Right for You?</h1>
          <p className="hero-subtitle">
            Answer 7 questions. Get a personalized suitability score,
            provider comparison, and interactive coverage map.
          </p>
          <Link href="/tool" className="btn btn-primary">Run the Check</Link>
        </div>
      </section>

      <section id="how-it-works">
        <p className="section-label reveal">The Methodology</p>
        <h2 className="section-title reveal">Six Factors.<br />One Score.</h2>
        <div className="factors-grid">
          {FACTORS.map((f) => (
            <div key={f.num} className="factor-card reveal">
              <p className="factor-num">{f.num}</p>
              <p className="factor-name">{f.name}</p>
              <p className="factor-desc">{f.desc}</p>
            </div>
          ))}
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

const FACTORS = [
  { num: '01', name: 'Location Type', desc: 'Remote and rural areas have fewer wired options, making Starlink\'s satellite coverage far more valuable.' },
  { num: '02', name: 'Existing Access', desc: 'If fiber is already at your door, Starlink rarely wins on speed or price. No service at all flips the equation.' },
  { num: '03', name: 'Local Providers', desc: 'We score your available ISPs on reliability, speed, and value — then stack them against Starlink\'s $120/mo baseline.' },
  { num: '04', name: 'Budget', desc: 'Starlink costs $120–$250/mo. If budget-conscious providers can meet your needs, they score higher here.' },
  { num: '05', name: 'Primary Use', desc: 'Gaming and latency-sensitive work penalize Starlink\'s 20–60ms average. Casual browsing and streaming are less affected.' },
  { num: '06', name: 'Household Size', desc: 'More users mean more simultaneous demand. Starlink\'s shared capacity can struggle with large households.' },
];
