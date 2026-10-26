import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const server = await readFile(new URL('../src/server.mjs', import.meta.url), 'utf8');
assert.match(server, /releaf_environment/);
assert.match(server, /releaf_inspect_apk/);
assert.match(server, /releaf_inspect_native/);
assert.match(server, /tools\/list/);
for (const file of ['../src/server.mjs', '../src/agent.mjs']) {
  const result = spawnSync(process.execPath, ['--check', new URL(file, import.meta.url).pathname], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || file + ' syntax check failed');
}
const self = spawnSync(process.execPath, [new URL('../src/server.mjs', import.meta.url).pathname, '--self-test'], { encoding: 'utf8', timeout: 10000 });
assert.equal(self.status, 0, self.stderr);
assert.match(self.stdout, /releaf-termux/);
console.log('RELeaF smoke tests passed (syntax + server self-test).');
