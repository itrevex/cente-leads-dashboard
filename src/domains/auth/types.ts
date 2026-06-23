export interface JwtPair {
  access: string;
  refresh: string;
}

export interface OtpSessionResponse {
  session_token: string;
}

export type LoginResponse = JwtPair | OtpSessionResponse;

export function isOtpSessionResponse(body: LoginResponse): body is OtpSessionResponse {
  return 'session_token' in body;
}
