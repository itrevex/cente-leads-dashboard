import { Inbox, CheckCircle2, Banknote } from 'lucide-react';
import type { LeadFunnelReport } from '../types';
import KpiCard from '../../overview/components/KpiCard';

interface Props {
  report: LeadFunnelReport;
}

export default function FunnelPanel({ report }: Props) {
  const maxCount = Math.max(...report.stages.map((s) => s.count), 1);

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 gap-4">
        <KpiCard
          brand
          label="Captured (period)"
          icon={Inbox}
          value={report.captured}
          caption="By field agents and branch staff"
        />
        <KpiCard
          label="Recommended"
          icon={CheckCircle2}
          value={report.recommended}
          caption={
            report.captured > 0
              ? `${Math.round((report.recommended / report.captured) * 100)}% of captured`
              : 'No leads in range'
          }
        />
        <KpiCard
          label="Decided"
          icon={Banknote}
          value={report.decided}
          caption={
            report.recommended > 0
              ? `${Math.round((report.decided / report.recommended) * 100)}% of recommended`
              : 'No recommendations in range'
          }
        />
      </div>

      <div className="flex flex-col gap-3">
        {report.stages.map((stage) => (
          <div key={stage.stage} className="flex items-center gap-3">
            <span className="w-44 shrink-0 text-sm text-ink-500 dark:text-ink-300">
              {stage.stage}
            </span>
            <div className="h-2 flex-1 rounded-pill bg-ink-100 dark:bg-ink-700">
              <div
                className="h-2 rounded-pill bg-cente-blue-600"
                style={{ width: `${(stage.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-sm font-medium text-ink-700 dark:text-ink-50">
              {stage.count}{' '}
              <span className="text-xs font-normal text-ink-400">({stage.pct_of_captured}%)</span>
            </span>
          </div>
        ))}
        {report.stages.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-400">No leads in this date range.</p>
        )}
      </div>
    </div>
  );
}
