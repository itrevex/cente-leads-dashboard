import { useState, type FormEvent } from 'react';

type Step = { kind: 'credentials' } | { kind: 'otp'; sessionToken: string };

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
      <form onSubmit={handleOtpSubmit}>
        <h1>Enter verification code</h1>
        {error && <p className="auth-error">{error}</p>}
        <div className="field">
          <label htmlFor="code">6-digit code</label>
          <input
            id="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit}>
      <h1>Sign in to Cente Leads</h1>
      {error && <p className="auth-error">{error}</p>}
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <button type="submit" className="auth-submit" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
