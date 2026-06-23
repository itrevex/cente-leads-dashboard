/// <reference types="astro/client" />

import type { CurrentUser } from './shared/types';

declare global {
  namespace App {
    interface Locals {
      user: CurrentUser;
      accessToken: string;
    }
  }
}

interface ImportMetaEnv {
  readonly API_BASE_URL: string;
  readonly COOKIE_SECURE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
