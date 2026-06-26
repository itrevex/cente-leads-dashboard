import { Landmark, Clock } from 'lucide-react';
import type { CooperativeHealthReport } from '../types';
import KpiCard from '../../overview/components/KpiCard';
import Badge from '../../../shared/components/Badge';

interface Props {
  report: CooperativeHealthReport;
}

function formatLatency(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export default function CooperativeHealthPanel({ report }: Props) {
  const latencies = report.cooperatives
    .map((c) => c.median_chair_latency_minutes)
    .filter((m): m is number => m !== null);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((sum, m) => sum + m, 0) / latencies.length)
    : null;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-4">
        <KpiCard
          brand
          label="Active cooperatives"
          icon={Landmark}
          value={report.cooperatives.length}
          caption="With leads in scope"
        />
        <KpiCard
          label="Avg. chair sign-off"
          icon={Clock}
          value={avgLatency ?? 0}
          caption={avgLatency !== null ? 'Median minutes across co-ops' : 'No signed leads yet'}
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-ink-400">
            <th className="py-2 font-medium">Cooperative</th>
            <th className="py-2 text-right font-medium">Active leads</th>
            <th className="py-2 text-right font-medium">Median chair latency</th>
          </tr>
        </thead>
        <tbody>
          {report.cooperatives.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-ink-400">
                No cooperatives in scope.
              </td>
            </tr>
          )}
          {report.cooperatives.map((c) => {
            const high = (c.median_chair_latency_minutes ?? 0) > 240;
            return (
              <tr key={c.cooperative_id} className="border-t border-ink-100 dark:border-ink-700">
                <td className="py-3 font-medium text-ink-700 dark:text-ink-50">
                  {c.cooperative_name}
                </td>
                <td className="py-3 text-right text-ink-500 dark:text-ink-300">{c.active_leads}</td>
                <td className="py-3 text-right">
                  <Badge
                    label={formatLatency(c.median_chair_latency_minutes)}
                    color={high ? 'yellow' : 'green'}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
