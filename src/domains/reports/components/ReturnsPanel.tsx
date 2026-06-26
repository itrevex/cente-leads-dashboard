import { RotateCcw, Send, XCircle } from 'lucide-react';
import type { ReturnReasonsReport } from '../types';
import KpiCard from '../../overview/components/KpiCard';
import Badge from '../../../shared/components/Badge';

interface Props {
  report: ReturnReasonsReport;
}

export default function ReturnsPanel({ report }: Props) {
  const maxCount = Math.max(...report.reasons.map((r) => r.count), 1);
  const resubmitPct =
    report.returned_total > 0 ? Math.round((report.resubmitted / report.returned_total) * 100) : 0;
  const lostPct =
    report.returned_total > 0
      ? Math.round((report.lost_after_return / report.returned_total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-4">
        <KpiCard
          brand
          label="Returned leads (period)"
          icon={RotateCcw}
          value={report.returned_total}
          caption="Returned to agent for resubmission"
        />
        <KpiCard
          label="Resubmitted"
          icon={Send}
          value={report.resubmitted}
          caption={`${resubmitPct}% resubmitted after return`}
        />
        <KpiCard
          label="Lost after return"
          icon={XCircle}
          value={report.lost_after_return}
          caption={`${lostPct}% never resubmitted`}
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-ink-400">
            <th className="py-2 font-medium">Return reason</th>
            <th className="py-2 font-medium">Count</th>
          </tr>
        </thead>
        <tbody>
          {report.reasons.length === 0 && (
            <tr>
              <td colSpan={2} className="py-6 text-center text-ink-400">
                No returned leads in this date range.
              </td>
            </tr>
          )}
          {report.reasons.map((r) => (
            <tr key={r.reason} className="border-t border-ink-100 dark:border-ink-700">
              <td className="py-3 text-ink-700 dark:text-ink-50">{r.reason}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-pill bg-ink-100 dark:bg-ink-700">
                    <div
                      className="h-2 rounded-pill bg-cente-yellow-600"
                      style={{ width: `${(r.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <Badge label={String(r.count)} color="neutral" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
