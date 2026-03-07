import { PROVIDERS, TYPE_COLORS } from '@/lib/data';

interface ProviderCardProps {
  providerKey: string;
  isStarlink?: boolean;
}

export default function ProviderCard({ providerKey, isStarlink }: ProviderCardProps) {
  const p = PROVIDERS[providerKey];
  if (!p) return null;

  return (
    <div className={`provider-result-card${isStarlink ? ' starlink' : ''}`}>
      <p className="prc-type">
        <span className="provider-type-dot" style={{ background: TYPE_COLORS[p.type] }} />
        {p.type.toUpperCase()}
      </p>
      <p className="prc-name">{p.name}</p>
      <div className="prc-stats">
        Speed: {p.speedLabel}<br />
        Latency: {p.latencyLabel}<br />
        Reliability: {p.reliability}%<br />
        {p.contract ? 'Contract required' : 'No contract'}
      </div>
      <p className="prc-price">
        ${p.price}
        <span className="prc-price-sub">
          /mo{isStarlink ? ` + $${p.equipment} HW` : ''}
        </span>
      </p>
    </div>
  );
}
