// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import process from 'node:process';

import tailwindcss from '@tailwindcss/vite';
import istanbul from 'vite-plugin-istanbul';

import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

const coverageEnabled = process.env.COVERAGE === 'true';

// e2e/bootstrap/server.mjs boots the built app directly under Node
// (`dist/server/entry.mjs`) so Playwright can run it behind the msw mock
// servers -- the Netlify adapter's output isn't a plain Node entry point
// (it's Netlify Functions-shaped), so e2e builds use the Node adapter
// while real deploys keep using Netlify.
const adapter = process.env.E2E === 'true' ? node({ mode: 'standalone' }) : netlify();

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],

  adapter,

  vite: {
    plugins: [
      tailwindcss(),
      coverageEnabled &&
        istanbul({
          include: 'src/**/*',
          exclude: ['node_modules', 'e2e', 'dist'],
          requireEnv: false,
          forceBuildInstrument: true,
        }),
    ].filter(Boolean),
  },
});
