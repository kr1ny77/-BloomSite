import { mkdir, cp, copyFile, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await copyFile('templates/index.html', 'dist/index.html');
await cp('static', 'dist/static', { recursive: true });
console.log('Bloom: static production output created in dist/');
