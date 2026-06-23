// Decodes (does not verify) the access token's payload to read `exp`. No
// verification needed here — the token only ever arrives via our own
// httpOnly cookie, having been issued by cente-leads-backend over HTTPS;
// nothing client-controlled is trusted as a result of this decode.

export function decodeJwtExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isExpiringSoon(token: string, bufferSeconds = 30): boolean {
  const exp = decodeJwtExpiry(token);
  if (exp === null) return true;
  return Date.now() / 1000 >= exp - bufferSeconds;
}
