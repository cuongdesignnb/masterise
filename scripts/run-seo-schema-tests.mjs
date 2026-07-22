import { mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDirectory = mkdtempSync(join(repositoryRoot, '.seo-schema-test-'));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repositoryRoot, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status || 1;
  return result.status === 0;
}

try {
  const compiled = run(process.execPath, [
    join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    'tests/offerSchema.test.ts',
    'src/lib/seo/offerSchema.ts',
    '--module', 'commonjs',
    '--moduleResolution', 'node',
    '--target', 'es2022',
    '--lib', 'es2022,dom',
    '--rootDir', repositoryRoot,
    '--outDir', outputDirectory,
    '--types', 'node',
    '--strict',
    '--esModuleInterop',
    '--skipLibCheck',
  ]);

  if (compiled) {
    run(process.execPath, ['--test', join(outputDirectory, 'tests', 'offerSchema.test.js')]);
    run(process.execPath, ['--test', join(repositoryRoot, 'tests', 'graphIntegrity.test.mjs')]);
  }
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
