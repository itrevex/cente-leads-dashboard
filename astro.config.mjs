// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import process from 'node:process';

import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';
import istanbul from 'vite-plugin-istanbul';

const coverageEnabled = process.env.COVERAGE === 'true';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],

  adapter: node({
    mode: 'standalone',
  }),

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
