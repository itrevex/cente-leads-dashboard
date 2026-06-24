import { Inbox, ClipboardList, Clock, RotateCcw, Download, ArrowRight } from 'lucide-react';
import type { OverviewReport } from '../types';
import { STAGE_MIX, STATUS_META, formatUgx, initialsOf } from '../presentation';
import { STAGE_ICONS } from '../../../shell/icons';
import KpiCard from './KpiCard';
import Badge from './Badge';
import Avatar from './Avatar';

interface Props {
  report: OverviewReport;
  firstName: string;
  scopeLabel: string;
  today: string;
}

const STAGE_COUNT_KEYS: Record<string, keyof OverviewReport> = {
  review: 'bank_reviewing',
  chairPending: 'stuck_at_chair_approval',
  returned: 'returned_to_agent',
};

export default function OverviewDashboard({ report, firstName, scopeLabel, today }: Props) {
  const barRows = Object.entries(report.by_status)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => [STATUS_META[status]?.label ?? status, count] as const);
  const maxBar = Math.max(...barRows.map(([, v]) => v), 1);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {scopeLabel} · {today}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800">
            <Download size={15} /> Export
          </button>
          <a
            href="/leads"
            className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
          >
            <Inbox size={15} /> Open Leads
          </a>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4">
        <KpiCard
          brand
          label="Total in Pipeline"
          icon={Inbox}
          value={report.total_in_pipeline}
          caption="All active leads in scope"
        />
        <KpiCard
          label="Bank Reviewing"
          icon={ClipboardList}
          value={report.bank_reviewing}
          caption="Current stage count"
        />
        <KpiCard
          label="Stuck at Chair Approval"
          icon={Clock}
          value={report.stuck_at_chair_approval}
          caption={report.stuck_at_chair_approval > 0 ? 'Follow up required' : 'No blockers'}
        />
        <KpiCard
          label="Returned to Agent"
          icon={RotateCcw}
          value={report.returned_to_agent}
          caption="Current stage count"
        />
      </div>

      <div className="mb-4 grid grid-cols-[2fr_1fr] gap-4">
        <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Recent Activity</h3>
            <a
              href="/leads"
              className="flex items-center gap-1 text-xs font-medium text-cente-blue-600 hover:text-cente-red-600 dark:text-cente-blue-300"
            >
              View all leads <ArrowRight size={13} />
            </a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-400 dark:text-ink-400">
                <th className="px-5 py-2 font-medium">Lead ID</th>
                <th className="px-2 py-2 font-medium">Applicant</th>
                <th className="px-2 py-2 font-medium">Source</th>
                <th className="px-2 py-2 font-medium">Cooperative</th>
                <th className="px-2 py-2 text-right font-medium">Amount</th>
                <th className="px-2 py-2 font-medium">Stage</th>
                <th className="px-5 py-2 font-medium">Branch</th>
              </tr>
            </thead>
            <tbody>
              {report.recent_activity.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-ink-400">
                    No leads yet.
                  </td>
                </tr>
              )}
              {report.recent_activity.map((lead) => {
                const meta = STATUS_META[lead.status] ?? { label: lead.status, color: 'neutral' };
                return (
                  <tr
                    key={lead.id}
                    className="cursor-pointer border-t border-ink-100 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700/40"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-ink-500 dark:text-ink-300">
                      {lead.id.slice(0, 8)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={initialsOf(lead.applicant_name)} />
                        <div>
                          <p className="font-medium text-ink-700 dark:text-ink-50">
                            {lead.applicant_name}
                          </p>
                          <p className="text-xs text-ink-400">{lead.applicant_nin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                      {lead.initiation_channel === 'agent' ? 'Field Agent' : 'Branch'}
                    </td>
                    <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                      {lead.cooperative_name ?? '-'}
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-ink-700 dark:text-ink-50">
                      {formatUgx(lead.amount_requested)}
                    </td>
                    <td className="px-2 py-3">
                      <Badge label={meta.label} color={meta.color} />
                    </td>
                    <td className="px-5 py-3 text-sm text-ink-500 dark:text-ink-300">
                      {lead.branch_name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
            <h3 className="border-b border-ink-100 px-5 py-4 text-sm font-semibold text-ink-700 dark:border-ink-700 dark:text-ink-50">
              Stage Mix
            </h3>
            {STAGE_MIX.map((stage, i) => {
              const Icon = STAGE_ICONS[stage.icon];
              const count = report[STAGE_COUNT_KEYS[stage.key]] as number;
              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-3 px-5 py-3 ${
                    i < STAGE_MIX.length - 1 ? 'border-b border-ink-100 dark:border-ink-700' : ''
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      stage.color === 'blue'
                        ? 'bg-cente-blue-100 text-cente-blue-700'
                        : 'bg-cente-yellow-100 text-cente-yellow-700'
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-700 dark:text-ink-50">
                      {count} {stage.label}
                    </p>
                    <p className="text-xs text-ink-400">{stage.sub}</p>
                  </div>
                  <a
                    href="/leads"
                    className="text-xs font-medium text-cente-blue-600 dark:text-cente-blue-300"
                  >
                    View
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Leads by Stage</h3>
          <span className="text-xs text-ink-400">Current snapshot</span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          {barRows.map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm text-ink-500 dark:text-ink-300">{label}</span>
              <div className="h-2 flex-1 rounded-pill bg-ink-100 dark:bg-ink-700">
                <div
                  className="h-2 rounded-pill bg-cente-blue-600"
                  style={{ width: `${(value / maxBar) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-medium text-ink-700 dark:text-ink-50">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
