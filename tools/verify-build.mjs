/**
 * tools/verify-build.mjs —— 产物自检（不参与发布，仅开发期核对）
 *
 * 核对四件事：
 *   1. lib/client.js 以 `window.__ModuleLoader__.load({` 开头，且 id 是 dsh-model-tabs
 *   2. 包裹体尾部有 `return module.exports;` 与闭合的 `});`
 *   3. external 生效：产物里是 `require("react")` 之类的调用，没有内联 React 实现
 *   4. lib/index.js 是 ESM 且导出 apply / inject
 *   5. 两个产物均为 UTF-8 无 BOM
 *
 * 用法：node tools/verify-build.mjs
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = resolve(ROOT, 'lib/client.js');
const HOST = resolve(ROOT, 'lib/index.js');

/** 客户端必须保留为 external 的模块清单（DSH 前端 staticModules 白名单）。 */
const EXTERNAL_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  'zod',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit',
];

const failures = [];

/**
 * 断言，失败时记录而非中断（一次跑完给出全部问题）。
 * @param {boolean} condition 断言条件
 * @param {string} message 失败说明
 */
function check(condition, message) {
  if (!condition) failures.push(message);
}

/**
 * 读文件并确认无 BOM。
 * @param {string} path 文件路径
 * @returns {Promise<string>} 文件内容
 */
async function readNoBom(path) {
  const raw = await readFile(path);
  check(raw[0] !== 0xef || raw[1] !== 0xbb || raw[2] !== 0xbf, `${path} 带 BOM，应为无 BOM UTF-8`);
  return raw.toString('utf8');
}

const client = await readNoBom(CLIENT);
const host = await readNoBom(HOST);

// 1) 包裹格式
check(client.startsWith('window.__ModuleLoader__.load({'), 'lib/client.js 开头不是 window.__ModuleLoader__.load({');
check(client.includes('id: "dsh-model-tabs"'), 'lib/client.js 的 id 不是 "dsh-model-tabs"');
check(client.includes('factory: (require) => {'), 'lib/client.js 缺少 factory: (require) => {');
check(client.includes('var module = { exports: {} };'), 'lib/client.js 缺少 module 载体');
check(client.includes('var exports = module.exports;'), 'lib/client.js 缺少 exports 别名');
check(client.includes('return module.exports;'), 'lib/client.js 结尾缺少 return module.exports');
check(client.trimEnd().endsWith('});'), 'lib/client.js 结尾缺少 });');

// 2) external 生效：产物里只允许出现白名单内的 require；
//    未被引用的 external 会被 esbuild 省略，不算错。
for (const name of EXTERNAL_MODULES) {
  void name;
}
for (const [, name] of client.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
  check(EXTERNAL_MODULES.includes(name), `lib/client.js 出现白名单外的 require("${name}")`);
}
// 至少 react 与 jsx-runtime 必须是以 require 形式存在
check(client.includes('require("react")'), 'lib/client.js 未见 require("react") —— external 可能未生效');
check(
  client.includes('require("react/jsx-runtime")'),
  'lib/client.js 未见 require("react/jsx-runtime") —— external 可能未生效',
);

// 3) 没有内联 React 实现（内联的判定特征：React 内部私有字段名 / 调度器实现）
const INLINE_MARKERS = [
  '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
  'ReactCurrentDispatcher',
  'reconcilerVersion',
];
for (const marker of INLINE_MARKERS) {
  check(!client.includes(marker), `lib/client.js 内联了 React 实现（命中 "${marker}"）—— external 未生效`);
}

// 4) Host 产物是 ESM 且导出 apply / inject
check(host.includes('export {'), 'lib/index.js 不是 ESM（缺少 export {）');
check(/\bapply\b/.test(host), 'lib/index.js 未导出 apply');
check(/\binject\b/.test(host), 'lib/index.js 未导出 inject');
check(!host.includes('module.exports'), 'lib/index.js 混入了 CJS 语法');

// 5) 结果
const clientBytes = Buffer.byteLength(client, 'utf8');
const hostBytes = Buffer.byteLength(host, 'utf8');
if (failures.length === 0) {
  console.log('[verify] ok');
  console.log(`[verify] lib/client.js ${clientBytes} bytes，包裹格式 / external / 无 BOM 均通过`);
  console.log(`[verify] lib/index.js  ${hostBytes} bytes，ESM 且导出 apply/inject`);
  process.exit(0);
}
console.error('[verify] 失败项：');
for (const item of failures) console.error(`  - ${item}`);
process.exit(1);
