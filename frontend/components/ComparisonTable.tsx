import { PROVIDERS, TYPE_COLORS } from '@/lib/data';
import { providerValueScore } from '@/lib/scoring';

interface ComparisonTableProps {
  compProviders: string[];
}

export default function ComparisonTable({ compProviders }: ComparisonTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Provider</th>
          <th>Type</th>
          <th>Max Speed</th>
          <th>Latency</th>
          <th>Price/mo</th>
          <th>Reliability</th>
          <th>Value Score</th>
        </tr>
      </thead>
      <tbody>
        {compProviders.map(key => {
          const p = PROVIDERS[key];
          const vs = providerValueScore(key);
          return (
            <tr key={key}>
              <td className="table-provider-name">{p.name}</td>
              <td>
                <span className="provider-type-dot" style={{ background: TYPE_COLORS[p.type] }} />
                {p.type}
              </td>
              <td>{p.speedLabel}</td>
              <td>{p.latencyLabel}</td>
              <td>${p.price}</td>
              <td>{p.reliability}%</td>
              <td>
                <div className="value-bar">
                  <div className="value-bar-bg">
                    <div className="value-bar-fill" style={{ width: `${vs}%` }} />
                  </div>
                  <span className="value-bar-num">{vs}</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
