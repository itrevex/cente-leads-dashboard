import { useState } from 'react';
import { UserRoundCheck, UserPlus, Download } from 'lucide-react';
import type { Agent, BranchOption, CooperativeOption } from '../types';
import { AGENT_STATUS_LABELS } from '../presentation';
import Badge from '../../../shared/components/Badge';
import Pagination from '../../../shared/components/Pagination';
import EditAgentModal from './EditAgentModal';
import NewAgentModal from './NewAgentModal';

const PAGE_SIZE = 10;

interface Props {
  initialAgents: Agent[];
  branchOptions: BranchOption[];
  cooperativeOptions: CooperativeOption[];
  canManage: boolean;
}

export default function AgentsTab({
  initialAgents,
  branchOptions,
  cooperativeOptions,
  canManage,
}: Props) {
  const [agents, setAgents] = useState(initialAgents);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(agents.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedAgents = agents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleCreated(agent: Agent) {
    setAgents((prev) => [agent, ...prev]);
    setShowNew(false);
  }

  function handleUpdated(agent: Agent) {
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? agent : a)));
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Agents
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            Field agents capture leads on mobile and submit them to the bank. They have no dashboard
            access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/agents/export"
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <Download size={15} /> Export
          </a>
          {canManage && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
            >
              <UserPlus size={15} /> Add agent
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-400">
              <th className="px-5 py-2 font-medium">Agent</th>
              <th className="px-2 py-2 font-medium">Branches</th>
              <th className="px-2 py-2 font-medium">Cooperatives covered</th>
              <th className="px-5 py-2 font-medium">Status</th>
              {canManage && <th className="px-5 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-5 py-6 text-center text-ink-400">
                  No agents found.
                </td>
              </tr>
            )}
            {pagedAgents.map((agent) => (
              <tr key={agent.id} className="border-t border-ink-100 dark:border-ink-700">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cente-blue-100 text-cente-blue-700">
                      <UserRoundCheck size={14} />
                    </span>
                    <div>
                      <p className="font-medium text-ink-700 dark:text-ink-50">{agent.full_name}</p>
                      <p className="text-xs text-ink-400">{agent.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">
                  {agent.branches.map((b) => b.name).join(', ') || '—'}
                </td>
                <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">
                  {agent.cooperatives.map((c) => c.name).join(', ') || '—'}
                </td>
                <td className="px-5 py-3">
                  <Badge
                    label={AGENT_STATUS_LABELS[agent.status] ?? agent.status}
                    color={agent.status === 'active' ? 'green' : 'red'}
                  />
                </td>
                {canManage && (
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setEditing(agent)}
                      className="cursor-pointer rounded-pill border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalCount={agents.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {editing && (
        <EditAgentModal
          agent={editing}
          branchOptions={branchOptions}
          onClose={() => setEditing(null)}
          onSaved={handleUpdated}
        />
      )}
      {showNew && (
        <NewAgentModal
          branchOptions={branchOptions}
          cooperativeOptions={cooperativeOptions}
          onClose={() => setShowNew(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
