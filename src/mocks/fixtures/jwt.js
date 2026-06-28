import { Buffer } from 'node:buffer';

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function makeJwt({ sub, role, exp }) {
  return [
    base64UrlEncode({ alg: 'none', typ: 'JWT' }),
    base64UrlEncode({ sub, role, exp }),
    '',
  ].join('.');
}

export function makeJwtPair(overrides = {}) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  return {
    access: makeJwt({ sub: 'user-system-admin', role: 'system_admin', exp, ...overrides }),
    refresh: `refresh-${overrides.sub ?? 'user-system-admin'}`,
  };
}
