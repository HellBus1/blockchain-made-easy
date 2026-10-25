import fs from 'node:fs';
import path from 'node:path';

const clientDir = path.resolve('dist/client');
const distDir = path.resolve('dist');

if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, distDir, { recursive: true });
  console.log('✓ Synced dist/client static assets to dist root for Cloudflare Pages compatibility.');
}
