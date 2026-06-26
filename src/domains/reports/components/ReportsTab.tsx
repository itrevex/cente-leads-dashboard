import { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import type {
  LeadFunnelReport,
  ReturnReasonsReport,
  AgentProductivityReport,
  CooperativeHealthReport,
  ReportTab as TabKey,
  DateRange,
} from '../types';
import { REPORT_TABS, REPORT_TAB_LABELS } from '../presentation';
import {
  fetchFunnelReport,
  fetchReturnReasonsReport,
  fetchAgentProductivityReport,
  fetchCooperativeHealthReport,
  exportUrl,
  ReportsApiError,
} from '../client';
import FunnelPanel from './FunnelPanel';
import ReturnsPanel from './ReturnsPanel';
import AgentProductivityPanel from './AgentProductivityPanel';
import CooperativeHealthPanel from './CooperativeHealthPanel';

type DateRangePreset = '3d' | '7d' | '30d' | 'custom';

interface Props {
  initialFunnel: LeadFunnelReport;
}

function presetToRange(preset: DateRangePreset, customFrom: string, customTo: string): DateRange {
  if (preset === 'custom') return { from: customFrom, to: customTo };
  const days = preset === '3d' ? 3 : preset === '7d' ? 7 : 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString().slice(0, 10) };
}

export default function ReportsTab({ initialFunnel }: Props) {
  const [tab, setTab] = useState<TabKey>('funnel');
  const [preset, setPreset] = useState<DateRangePreset>('7d');
  const [customFrom, setCustomFrom] = useState(new Date().toISOString().slice(0, 10));
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));

  const [funnel, setFunnel] = useState<LeadFunnelReport | null>(initialFunnel);
  const [returns, setReturns] = useState<ReturnReasonsReport | null>(null);
  const [agents, setAgents] = useState<AgentProductivityReport | null>(null);
  const [coops, setCoops] = useState<CooperativeHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = presetToRange(preset, customFrom, customTo);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (tab === 'funnel') setFunnel(await fetchFunnelReport(range));
        if (tab === 'returns') setReturns(await fetchReturnReasonsReport(range));
        if (tab === 'agent') setAgents(await fetchAgentProductivityReport(range));
        if (tab === 'coop') setCoops(await fetchCooperativeHealthReport(range));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ReportsApiError ? JSON.stringify(err.body) : 'Failed to load report.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tab, preset, customFrom, customTo]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Operational Reports
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            Pulled live from the Cente Leads platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as DateRangePreset)}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
          >
            <option value="3d">Last 3 days</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="custom">Custom range</option>
          </select>
          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-sm border border-ink-200 px-2 py-2 text-sm text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-sm border border-ink-200 px-2 py-2 text-sm text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </div>
          )}
          <a
            href={exportUrl(tab, range, 'pdf')}
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <FileText size={15} /> PDF
          </a>
          <a
            href={exportUrl(tab, range, 'csv')}
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <FileSpreadsheet size={15} /> CSV
          </a>
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        <div className="flex border-b border-ink-100 px-2 dark:border-ink-700">
          {REPORT_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-medium ${
                tab === t
                  ? 'border-cente-blue-600 text-cente-blue-600 dark:text-cente-blue-300'
                  : 'border-transparent text-ink-500 hover:text-ink-700 dark:text-ink-300'
              }`}
            >
              {REPORT_TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="p-5">
          {error && <p className="text-sm text-cente-red-600">{error}</p>}
          {!error && loading && (
            <p className="py-6 text-center text-sm text-ink-400">Loading report…</p>
          )}
          {!error && !loading && (
            <>
              {tab === 'funnel' && funnel && <FunnelPanel report={funnel} />}
              {tab === 'returns' && returns && <ReturnsPanel report={returns} />}
              {tab === 'agent' && agents && <AgentProductivityPanel report={agents} />}
              {tab === 'coop' && coops && <CooperativeHealthPanel report={coops} />}
              <div className="mt-4 flex items-center gap-1 text-xs text-ink-400">
                <Download size={12} /> Export reflects the selected date range and tab.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
