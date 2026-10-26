import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

await build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  minify: true,
  jsx: 'automatic',
  alias: { 'cursor/canvas': './src/canvas-shim.tsx' },
  outfile: 'docs/app.js',
});

const bundle = await readFile('docs/app.js');
const version = createHash('sha256').update(bundle).digest('hex').slice(0, 16);
const html = await readFile('docs/index.html', 'utf8');
if (!/src="app\.js(?:\?v=[a-f0-9]+)?"/.test(html)) {
  throw new Error('Script app.js não encontrado em docs/index.html');
}
await writeFile('docs/index.html', html.replace(/src="app\.js(?:\?v=[a-f0-9]+)?"/, `src="app.js?v=${version}"`));
console.log(`Build publicado com versão ${version}`);
