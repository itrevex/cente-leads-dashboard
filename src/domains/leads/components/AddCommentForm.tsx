import { useState } from 'react';
import { addComment, LeadsApiError } from '../client';

interface Props {
  leadId: string;
}

export default function AddCommentForm({ leadId }: Props) {
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await addComment(leadId, body.trim(), isInternal);
      window.location.reload();
    } catch (err) {
      setError(err instanceof LeadsApiError ? JSON.stringify(err.body) : 'Failed to post comment.');
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-ink-100 p-4 dark:border-ink-700"
    >
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        className="w-full rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
      />
      {error && <p className="mt-2 text-xs text-cente-red-600">{error}</p>}
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-300">
          <input
            type="checkbox"
            checked={!isInternal}
            onChange={(e) => setIsInternal(!e.target.checked)}
          />
          Visible to agent
        </label>
        <button
          type="submit"
          disabled={!body.trim() || saving}
          className="cursor-pointer rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Posting…' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
