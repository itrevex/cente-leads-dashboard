import { useEffect, useState } from 'react';
import { Download, FileSearch } from 'lucide-react';
import type { AuditEvent, AuditFilters } from '../types';
import { listAuditEvents, auditExportUrl, AuditApiError } from '../client';
import Avatar from '../../../shared/components/Avatar';
import Pagination from '../../../shared/components/Pagination';

type DateRangePreset = '7d' | '30d' | 'custom';

const PAGE_SIZE = 20;

function presetToFilters(
  preset: DateRangePreset,
  customFrom: string,
  customTo: string,
): AuditFilters {
  if (preset === 'custom') return { occurred_after: customFrom, occurred_before: customTo };
  const days = preset === '7d' ? 7 : 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { occurred_after: from.toISOString().slice(0, 10) };
}

interface Props {
  initialEvents: AuditEvent[];
}

export default function AuditLogTab({ initialEvents }: Props) {
  const [preset, setPreset] = useState<DateRangePreset>('7d');
  const [customFrom, setCustomFrom] = useState(new Date().toISOString().slice(0, 10));
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filters = presetToFilters(preset, customFrom, customTo);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAuditEvents(filters)
      .then((results) => {
        if (!cancelled) {
          setEvents(results);
          setPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof AuditApiError ? JSON.stringify(err.body) : 'Failed to load audit log.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preset, customFrom, customTo]);

  const pageCount = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedEvents = events.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            Every system event is captured here — visible to Head of Loans, Compliance, MCP and
            System Admin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as DateRangePreset)}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
          >
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
            href={auditExportUrl(filters)}
            className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
          >
            <Download size={15} /> Export
          </a>
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        {error && <p className="px-5 py-4 text-sm text-cente-red-600">{error}</p>}
        {!error && loading && (
          <p className="px-5 py-6 text-center text-sm text-ink-400">Loading audit events…</p>
        )}
        {!error && !loading && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-400">
                <th className="px-5 py-2 font-medium">Timestamp</th>
                <th className="px-2 py-2 font-medium">User</th>
                <th className="px-2 py-2 font-medium">Action</th>
                <th className="px-2 py-2 font-medium">Subject</th>
                <th className="px-5 py-2 font-medium">IP / device</th>
              </tr>
            </thead>
            <tbody>
              {pagedEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ink-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileSearch size={20} className="text-ink-300" />
                      No audit entries in this date range.
                    </div>
                  </td>
                </tr>
              )}
              {pagedEvents.map((event) => (
                <tr key={event.id} className="border-t border-ink-100 dark:border-ink-700">
                  <td className="px-5 py-3 font-mono text-xs text-ink-400">
                    {new Date(event.occurred_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar
                        initials={event.actor_user_name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      />
                      <span className="font-medium text-ink-700 dark:text-ink-50">
                        {event.actor_user_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <code className="rounded-sm bg-cente-blue-100 px-2 py-1 text-xs text-cente-blue-700 dark:bg-cente-blue-700/20 dark:text-cente-blue-300">
                      {event.action}
                    </code>
                  </td>
                  <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                    {event.subject}
                    {event.reason && <span className="text-ink-400"> · {event.reason}</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-400">
                    {event.ip_address ? (
                      <>
                        {event.ip_address}
                        {event.device_label && ` · ${event.device_label}`}
                      </>
                    ) : (
                      <span className="capitalize text-ink-400">{event.source_surface}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalCount={events.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
