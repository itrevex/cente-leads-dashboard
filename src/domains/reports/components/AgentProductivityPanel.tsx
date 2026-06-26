import { UserRoundCheck } from 'lucide-react';
import type { AgentProductivityReport } from '../types';
import KpiCard from '../../overview/components/KpiCard';

interface Props {
  report: AgentProductivityReport;
}

export default function AgentProductivityPanel({ report }: Props) {
  const totalLeads = report.agents.reduce((sum, a) => sum + a.leads_total, 0);
  const avgChairApproval = report.agents.length
    ? Math.round(
        report.agents.reduce((sum, a) => sum + a.chair_approval_rate_pct, 0) / report.agents.length,
      )
    : 0;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-4">
        <KpiCard
          brand
          label="Agent leads (period)"
          icon={UserRoundCheck}
          value={totalLeads}
          caption={`Across ${report.agents.length} agent${report.agents.length === 1 ? '' : 's'}`}
        />
        <KpiCard
          label="Avg. chair-approval rate"
          icon={UserRoundCheck}
          value={avgChairApproval}
          caption="% of leads chair-signed"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-ink-400">
            <th className="py-2 font-medium">Agent</th>
            <th className="py-2 text-right font-medium">Leads (period)</th>
            <th className="py-2 text-right font-medium">Chair-approved %</th>
            <th className="py-2 text-right font-medium">Recommend %</th>
          </tr>
        </thead>
        <tbody>
          {report.agents.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-ink-400">
                No agent activity in this date range.
              </td>
            </tr>
          )}
          {report.agents.map((a) => (
            <tr key={a.agent_id} className="border-t border-ink-100 dark:border-ink-700">
              <td className="py-3 font-medium text-ink-700 dark:text-ink-50">{a.agent_name}</td>
              <td className="py-3 text-right text-ink-500 dark:text-ink-300">{a.leads_total}</td>
              <td className="py-3 text-right text-ink-500 dark:text-ink-300">
                {a.chair_approval_rate_pct}%
              </td>
              <td className="py-3 text-right text-ink-500 dark:text-ink-300">
                {a.recommend_rate_pct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
