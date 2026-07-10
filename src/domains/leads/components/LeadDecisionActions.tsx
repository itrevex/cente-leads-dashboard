import { useState } from 'react';
import { X } from 'lucide-react';
import {
  requestInfo,
  recommendLead,
  recommendDecline,
  declineLead,
  returnToAgent,
  LeadsApiError,
} from '../client';

interface Props {
  leadId: string;
  // Only branch_manager/head_of_loans hold decline_leads (ADR-0034) — loan
  // officers see "Recommend Decline" (a flag) instead of "Decline" (final).
  canFinalizeDecline: boolean;
  // Request Info / Return to Agent only apply to a lead still in `review`;
  // once a loan officer has flagged decline_recommended, only Recommend
  // (overrule) or Decline (finalize) make sense.
  isDeclineRecommended: boolean;
}

type ActionKind =
  | 'request_info'
  | 'recommend'
  | 'recommend_decline'
  | 'decline'
  | 'return_to_agent';

const ACTION_META: Record<
  ActionKind,
  { label: string; title: string; fieldLabel: string; required: boolean; buttonClass: string }
> = {
  request_info: {
    label: 'Request Info',
    title: 'Request more information',
    fieldLabel: 'What information is needed from the agent?',
    required: true,
    buttonClass:
      'border border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40',
  },
  recommend: {
    label: 'Recommend',
    title: 'Recommend this lead',
    fieldLabel: 'Note (optional)',
    required: false,
    buttonClass: 'bg-success text-white hover:opacity-90',
  },
  recommend_decline: {
    label: 'Recommend Decline',
    title: 'Flag this lead for decline',
    fieldLabel: 'Reason for recommending decline',
    required: true,
    buttonClass: 'bg-cente-red-600 text-white hover:bg-cente-red-700',
  },
  decline: {
    label: 'Decline',
    title: 'Decline this lead',
    fieldLabel: 'Reason for declining',
    required: true,
    buttonClass: 'bg-cente-red-600 text-white hover:bg-cente-red-700',
  },
  return_to_agent: {
    label: 'Return to Agent',
    title: 'Return this lead to the agent',
    fieldLabel: 'Reasons for returning (at least one required)',
    required: true,
    buttonClass:
      'border border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40',
  },
};

export default function LeadDecisionActions({
  leadId,
  canFinalizeDecline,
  isDeclineRecommended,
}: Props) {
  const visibleActions: ActionKind[] = isDeclineRecommended
    ? canFinalizeDecline
      ? ['recommend', 'decline']
      : ['recommend']
    : canFinalizeDecline
      ? ['request_info', 'recommend', 'decline', 'return_to_agent']
      : ['request_info', 'recommend', 'recommend_decline', 'return_to_agent'];

  const [open, setOpen] = useState<ActionKind | null>(null);
  const [text, setText] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [reasonDraft, setReasonDraft] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openModal(kind: ActionKind) {
    setOpen(kind);
    setText('');
    setReasons([]);
    setReasonDraft('');
    setNote('');
    setError(null);
  }

  function closeModal() {
    if (saving) return;
    setOpen(null);
  }

  function addReason() {
    const value = reasonDraft.trim();
    if (!value) return;
    setReasons((prev) => [...prev, value]);
    setReasonDraft('');
  }

  function removeReason(index: number) {
    setReasons((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!open) return;
    const meta = ACTION_META[open];
    if (open === 'return_to_agent') {
      if (reasons.length === 0) return;
    } else if (meta.required && !text.trim()) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (open === 'request_info') {
        await requestInfo(leadId, text);
      } else if (open === 'recommend') {
        await recommendLead(leadId, text);
      } else if (open === 'recommend_decline') {
        await recommendDecline(leadId, text);
      } else if (open === 'decline') {
        await declineLead(leadId, text);
      } else {
        await returnToAgent(leadId, reasons, note);
      }
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof LeadsApiError
          ? JSON.stringify(err.body)
          : `Failed to ${meta.label.toLowerCase()}.`,
      );
      setSaving(false);
    }
  }

  const meta = open ? ACTION_META[open] : null;
  const valid =
    open === 'return_to_agent'
      ? reasons.length > 0
      : meta
        ? !meta.required || text.trim().length > 0
        : false;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {visibleActions.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => openModal(kind)}
            className={`cursor-pointer rounded-pill px-4 py-2 text-sm font-medium ${ACTION_META[kind].buttonClass}`}
          >
            {ACTION_META[kind].label}
          </button>
        ))}
      </div>

      {open && meta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <form
            onSubmit={handleConfirm}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">{meta.title}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer text-ink-400 hover:text-ink-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4">
              {open === 'return_to_agent' ? (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
                    {meta.fieldLabel}
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={reasonDraft}
                        onChange={(e) => setReasonDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addReason();
                          }
                        }}
                        placeholder="Type a reason and press Enter"
                        className="flex-1 rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                      />
                      <button
                        type="button"
                        onClick={addReason}
                        className="cursor-pointer rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
                      >
                        Add
                      </button>
                    </div>
                  </label>
                  {reasons.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {reasons.map((reason, index) => (
                        <li
                          key={`${reason}-${index}`}
                          className="flex items-center gap-1 rounded-pill border border-ink-200 px-3 py-1 text-xs text-ink-600 dark:border-ink-700 dark:text-ink-200"
                        >
                          {reason}
                          <button
                            type="button"
                            onClick={() => removeReason(index)}
                            className="cursor-pointer text-ink-400 hover:text-ink-700"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
                    Note (optional)
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
                  {meta.fieldLabel}
                  <textarea
                    autoFocus
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                  />
                </label>
              )}
              {error && <p className="mt-3 text-xs text-cente-red-600">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-700">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!valid || saving}
                className={`cursor-pointer rounded-pill px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${meta.buttonClass}`}
              >
                {saving ? 'Submitting…' : `Confirm ${meta.label}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
