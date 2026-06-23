import { useState, type FormEvent } from 'react';

type Step = { kind: 'credentials' } | { kind: 'otp'; sessionToken: string };

const inputClass =
  'w-full rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-700 outline-none focus:border-cente-blue-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100';
const labelClass = 'mb-1 block text-sm font-medium text-ink-600 dark:text-ink-300';
const submitClass =
  'w-full rounded-pill bg-cente-blue-600 py-3 font-medium text-white transition hover:bg-cente-red-600 disabled:cursor-not-allowed disabled:opacity-60';

export default function LoginForm() {
  const [step, setStep] = useState<Step>({ kind: 'credentials' });
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentialsSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'Login failed.');
        return;
      }
      if (body.step === 'otp_required') {
        setStep({ kind: 'otp', sessionToken: body.session_token });
      } else {
        window.location.href = '/';
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    if (step.kind !== 'otp') return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: step.sessionToken, code }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'Verification failed.');
        return;
      }
      window.location.href = '/';
    } finally {
      setSubmitting(false);
    }
  }

  if (step.kind === 'otp') {
    return (
      <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
        <h1 className="mb-2 text-xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
          Enter verification code
        </h1>
        {error && <p className="text-sm text-cente-red-500">{error}</p>}
        <div>
          <label htmlFor="code" className={labelClass}>
            6-digit code
          </label>
          <input
            id="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            className={inputClass}
          />
        </div>
        <button type="submit" className={submitClass} disabled={submitting}>
          {submitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
      <h1 className="mb-2 text-xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
        Sign in to Cente Leads
      </h1>
      {error && <p className="text-sm text-cente-red-500">{error}</p>}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={inputClass}
        />
      </div>
      <button type="submit" className={submitClass} disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
