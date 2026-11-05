import { mkdir, cp, copyFile, rm } from 'node:fs/promises';
import { build } from 'esbuild';
await build({
  entryPoints: ['scripts/product-viewer-source.js'],
  outfile: 'static/js/product-viewer.js',
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2022',
  legalComments: 'eof',
});
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await copyFile('templates/index.html', 'dist/index.html');
await cp('static', 'dist/static', { recursive: true });
console.log('Bloom: static production output created in dist/');
