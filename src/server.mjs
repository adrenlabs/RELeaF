#!/usr/bin/env node
/**
 * RELeaF — lightweight static-analysis MCP server for Termux.
 * Uses only Node.js built-ins and caller-installed command-line tools.
 * Never installs or executes analyzed APK/DEX/ELF inputs.
 */
import { spawn } from 'node:child_process';
import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const VERSION = '0.1.0';
const NAME = 'releaf-termux';
const ROOT = path.join(homedir(), '.local', 'share', 'releaf', 'workspace');
const MAX_OUTPUT = 30000;
const TOOLS = [
  { name: 'releaf_environment', description: 'Report Termux runtime and common analysis-tool availability.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'releaf_inspect_apk', description: 'List APK entries and identify DEX files and native libraries without executing the APK.', inputSchema: { type: 'object', properties: { apkPath: { type: 'string', description: 'Absolute path to an APK file' } }, required: ['apkPath'], additionalProperties: false } },
  { name: 'releaf_decompile_dex', description: 'Run JADX on an APK or DEX file if jadx is installed. Writes results under the RELeaF workspace.', inputSchema: { type: 'object', properties: { inputPath: { type: 'string' } }, required: ['inputPath'], additionalProperties: false } },
  { name: 'releaf_extract_native_libs', description: 'Extract native .so members from an APK using unzip into the private RELeaF workspace.', inputSchema: { type: 'object', properties: { apkPath: { type: 'string' } }, required: ['apkPath'], additionalProperties: false } },
  { name: 'releaf_inspect_native', description: 'Inspect an ELF shared library using readelf and strings when available.', inputSchema: { type: 'object', properties: { libraryPath: { type: 'string' } }, required: ['libraryPath'], additionalProperties: false } },
  { name: 'releaf_search_sources', description: 'Search text files under the RELeaF workspace for a literal term.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false } }
];

function send(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }
function result(text, isError = false) { return { content: [{ type: 'text', text: String(text).slice(0, MAX_OUTPUT) }], ...(isError ? { isError: true } : {}) }; }
async function executable(name) {
  const dirs = (process.env.PATH || '').split(':');
  for (const dir of dirs) { try { await access(path.join(dir, name)); return path.join(dir, name); } catch {} }
  return null;
}
async function run(cmd, args, timeout = 120000) {
  return await new Promise(resolve => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '', done = false;
    const finish = value => { if (done) return; done = true; clearTimeout(timer); resolve(value); };
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', s => { if (out.length < MAX_OUTPUT) out += s; });
    child.stderr.on('data', s => { if (err.length < MAX_OUTPUT) err += s; });
    child.on('error', e => finish({ code: -1, stdout: out, stderr: e.message }));
    child.on('close', code => finish({ code, stdout: out, stderr: err }));
    const timer = setTimeout(() => { child.kill('SIGTERM'); finish({ code: -1, stdout: out, stderr: 'Timed out' }); }, timeout);
  });
}
async function requireFile(p) {
  if (!path.isAbsolute(p)) throw new Error('Provide an absolute path.');
  const s = await stat(p);
  if (!s.isFile()) throw new Error('Path is not a file.');
  return p;
}
async function call(name, args) {
  await mkdir(ROOT, { recursive: true, mode: 0o700 });
  if (name === 'releaf_environment') {
    const checks = {};
    for (const t of ['node','unzip','jadx','apktool','readelf','strings','r2','rizin']) checks[t] = Boolean(await executable(t));
    return result(JSON.stringify({ name: NAME, version: VERSION, platform: process.platform, arch: process.arch, node: process.version, workspace: ROOT, tools: checks }, null, 2));
  }
  if (name === 'releaf_inspect_apk') {
    const p = await requireFile(args.apkPath);
    if (path.extname(p).toLowerCase() !== '.apk') throw new Error('Input must have .apk extension.');
    const unzip = await executable('unzip');
    if (!unzip) throw new Error('unzip is missing. Install it with: pkg install unzip');
    const r = await run(unzip, ['-Z1', p], 120000);
    if (r.code !== 0) throw new Error(r.stderr || 'Could not list APK archive.');
    const entries = r.stdout.split('\n').filter(Boolean);
    const dex = entries.filter(x => /^classes(\d*)?\.dex$/i.test(x));
    const libs = entries.filter(x => /^lib\/[^/]+\/[^/]+\.so$/i.test(x));
    return result(JSON.stringify({ apkPath: p, entryCount: entries.length, dexFiles: dex, nativeLibraries: libs }, null, 2));
  }
  if (name === 'releaf_decompile_dex') {
    const p = await requireFile(args.inputPath);
    const jadx = await executable('jadx');
    if (!jadx) throw new Error('jadx is missing. Check package availability with: pkg search jadx');
    const outDir = path.join(ROOT, 'jadx-' + Date.now());
    const r = await run(jadx, ['-d', outDir, p], 1800000);
    return result(JSON.stringify({ exitCode: r.code, outputDirectory: outDir, stdout: r.stdout, stderr: r.stderr }, null, 2), r.code !== 0);
  }
  if (name === 'releaf_extract_native_libs') {
    const p = await requireFile(args.apkPath);
    const unzip = await executable('unzip');
    if (!unzip) throw new Error('unzip is missing. Install it with: pkg install unzip');
    const list = await run(unzip, ['-Z1', p], 120000);
    if (list.code !== 0) throw new Error(list.stderr || 'Could not list APK archive.');
    const libs = list.stdout.split('\n').filter(x => /^lib\/(arm64-v8a|armeabi-v7a|x86|x86_64)\/[^/]+\.so$/i.test(x));
    const outDir = path.join(ROOT, 'native-' + Date.now());
    await mkdir(outDir, { recursive: true, mode: 0o700 });
    const extracted = [];
    for (const member of libs) {
      const abi = member.split('/')[1], base = path.basename(member);
      const targetDir = path.join(outDir, abi); await mkdir(targetDir, { recursive: true });
      const r = await run(unzip, ['-o', '-qq', p, member, '-d', outDir], 120000);
      if (r.code !== 0) continue;
      extracted.push(path.join(outDir, member));
    }
    return result(JSON.stringify({ outputDirectory: outDir, extractedCount: extracted.length, files: extracted }, null, 2));
  }
  if (name === 'releaf_inspect_native') {
    const p = await requireFile(args.libraryPath);
    const report = { libraryPath: p, commands: {} };
    for (const [tool, flags] of [['readelf',['-h','-d','-Ws',p]],['strings',[p]]]) {
      const exe = await executable(tool);
      if (!exe) { report.commands[tool] = { status: 'missing' }; continue; }
      const r = await run(exe, flags, 120000);
      report.commands[tool] = { exitCode: r.code, stdout: r.stdout, stderr: r.stderr };
    }
    return result(JSON.stringify(report, null, 2));
  }
  if (name === 'releaf_search_sources') {
    const query = String(args.query || '');
    if (!query || query.length > 300) throw new Error('query must contain 1–300 characters.');
    const found = [];
    async function walk(dir) {
      let items; try { items = await readdir(dir, { withFileTypes: true }); } catch { return; }
      for (const item of items) {
        const p = path.join(dir, item.name);
        if (item.isDirectory()) await walk(p);
        else if (item.isFile() && /\.(java|kt|xml|smali|json|txt|md)$/i.test(item.name)) {
          let s; try { s = await readFile(p, 'utf8'); } catch { continue; }
          const lines = s.split('\n');
          for (let i = 0; i < lines.length; i++) if (lines[i].includes(query)) found.push({ file: p, line: i + 1, text: lines[i].slice(0, 500) });
        }
      }
    }
    await walk(ROOT);
    return result(JSON.stringify({ query, matches: found.slice(0, 200), truncated: found.length > 200 }, null, 2));
  }
  throw new Error('Unknown tool: ' + name);
}

async function handle(msg) {
  if (msg.method === 'initialize') return { jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: NAME, version: VERSION } } };
  if (msg.method === 'ping') return { jsonrpc: '2.0', id: msg.id, result: {} };
  if (msg.method === 'tools/list') return { jsonrpc: '2.0', id: msg.id, result: { tools: TOOLS } };
  if (msg.method === 'tools/call') {
    try { const value = await call(msg.params?.name, msg.params?.arguments || {}); return { jsonrpc: '2.0', id: msg.id, result: value }; }
    catch (e) { return { jsonrpc: '2.0', id: msg.id, result: result(e.message, true) }; }
  }
  if (msg.id !== undefined) return { jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'Method not found' } };
  return null;
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  while (true) {
    const i = buffer.indexOf('\n'); if (i < 0) break;
    const line = buffer.slice(0, i).trim(); buffer = buffer.slice(i + 1);
    if (!line) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    Promise.resolve(handle(msg)).then(res => { if (res) send(res); }).catch(e => { if (msg.id !== undefined) send({ jsonrpc:'2.0', id:msg.id, error:{code:-32603,message:e.message} }); });
  }
});
if (process.argv.includes('--self-test')) {
  process.stdout.write(JSON.stringify({ server: NAME, version: VERSION, toolCount: TOOLS.length, tools: TOOLS.map(t => t.name) }, null, 2) + '\n');
}
