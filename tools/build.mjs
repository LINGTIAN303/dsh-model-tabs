/**
 * dsh-model-tabs —— 构建脚本
 *
 * 两个产物：
 *   lib/index.js   Host 半边：ESM，esbuild 直出
 *   lib/client.js  Client 半边：esbuild 打成 CJS，再**字符串包裹**成 DSH 前端
 *                  要求的 `window.__ModuleLoader__.load({ id, factory })` 形态
 *
 * 为什么客户端要包一层：
 *   DSH 的浏览器端模块加载器按 `{ id, factory: (require) => module.exports }`
 *   注册插件模块；factory 内部由加载器注入 `require`，只能拿到 staticModules
 *   白名单里的模块（react / react-dom / cordis / zod / 各 dsh-client-ui-* 包）。
 *   所以打包时这些依赖必须标 external，产物里保留 `require("react")` 调用，
 *   由宿主在运行时注入；若打进去会得到第二份 React 实例，hooks 直接失效。
 *
 * 用法：
 *   node tools/build.mjs            一次构建
 *   node tools/build.mjs --watch    监听源码变化持续重建
 */

import { build, context } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY_HOST = resolve(ROOT, 'src/host/index.js');
const ENTRY_CLIENT = resolve(ROOT, 'src/client/index.js');
const OUT_DIR = resolve(ROOT, 'lib');
const OUT_HOST = resolve(OUT_DIR, 'index.js');
const OUT_CLIENT = resolve(OUT_DIR, 'client.js');

/** 插件模块 id：必须与 package.json 的 name、cordis.patch.yml 的 id 一致。 */
const PLUGIN_ID = 'dsh-model-tabs';

/**
 * 客户端 external 清单：DSH 前端 staticModules 白名单（实测可用）。
 * 这些模块由宿主注入，不能打进产物，否则会得到重复的 React / 重复的 slot 注册表。
 */
const CLIENT_EXTERNAL = [
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

/** 写文件时强制 UTF-8 且不带 BOM（Node 默认就是无 BOM，这里显式说明意图）。 */
const writeUtf8 = (path, content) => writeFile(path, content, 'utf8');

/**
 * 把 esbuild 产出的 CJS 代码包成 DSH 的 ModuleLoader 注册格式。
 *
 * 包裹体必须提供 module / exports / require 三个名字：
 *   · factory 形参 `require` 由宿主传入，指向 staticModules 白名单；
 *   · `module` / `exports` 是 CJS 语义载体，esbuild 产物会往 exports 上挂 apply/inject；
 *   · 结尾返回 module.exports，作为该模块的导出对象。
 * @param {string} code esbuild 产出的 CJS 源码
 * @returns {string} 可直接作为浏览器脚本执行的完整文件内容
 */
function wrapClientModule(code) {
  return `window.__ModuleLoader__.load({
  id: ${JSON.stringify(PLUGIN_ID)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${code
  .split('\n')
  .map((line) => (line.length > 0 ? `    ${line}` : line))
  .join('\n')}
    return module.exports;
  },
});
`;
}

/** Host 半边的 esbuild 配置（ESM，Node 平台，无 external）。 */
function hostOptions() {
  return {
    entryPoints: [ENTRY_HOST],
    outfile: OUT_HOST,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    sourcemap: false,
    charset: 'utf8',
    logLevel: 'silent',
  };
}

/**
 * Client 半边的 esbuild 配置。
 * format 用 cjs：产物里是 `module.exports` / `require(...)` 语义，正好被 factory 包裹体接住。
 * loader 把 .js 当 jsx：本项目源码用 .js 后缀写 JSX。
 */
function clientOptions() {
  return {
    entryPoints: [ENTRY_CLIENT],
    bundle: true,
    write: false, // 只要内存中的代码，随后自行包裹并写盘
    format: 'cjs',
    platform: 'browser',
    target: 'chrome120',
    external: CLIENT_EXTERNAL,
    loader: { '.js': 'jsx' }, // 源码 .js 内含 JSX，需要显式开启
    jsx: 'automatic', // 自动运行时，从 react/jsx-runtime 取 jsx()
    sourcemap: false,
    charset: 'utf8',
    logLevel: 'silent',
  };
}

/**
 * 构建 Host 半边。
 * @returns {Promise<number>} 产出的字节数
 */
async function buildHost() {
  await build(hostOptions());
  const text = await readFile(OUT_HOST, 'utf8');
  return Buffer.byteLength(text, 'utf8');
}

/**
 * 构建 Client 半边：esbuild → 字符串包裹 → 写 lib/client.js。
 * @returns {Promise<number>} 产出的字节数
 */
async function buildClient() {
  const result = await build(clientOptions());
  const output = result.outputFiles?.[0];
  if (!output) throw new Error('esbuild 未返回客户端产物');
  const wrapped = wrapClientModule(output.text);
  await writeUtf8(OUT_CLIENT, wrapped);
  return Buffer.byteLength(wrapped, 'utf8');
}

/**
 * 跑一次全量构建并打印结果。
 * @param {boolean} [verbose] 是否打印耗时与产物大小明细
 */
async function buildOnce(verbose = true) {
  await mkdir(OUT_DIR, { recursive: true });
  const startedAt = Date.now();
  const [hostBytes, clientBytes] = await Promise.all([buildHost(), buildClient()]);
  if (verbose) {
    const ms = Date.now() - startedAt;
    console.log(`[build] ok  ${ms}ms`);
    console.log(`[build] lib/index.js   ${hostBytes} bytes  (esm / node)`);
    console.log(`[build] lib/client.js  ${clientBytes} bytes  (cjs wrapped in __ModuleLoader__.load)`);
  }
}

/**
 * watch 模式：两个构建各自持有 esbuild context，源码变化自动重建。
 * client 侧因为要二次包裹，用 onEnd 回调在每次重建后重新包裹写盘。
 */
async function watchAll() {
  await mkdir(OUT_DIR, { recursive: true });

  const hostCtx = await context({
    ...hostOptions(),
    plugins: [
      {
        name: 'log-host',
        setup(pluginBuild) {
          pluginBuild.onEnd((result) => {
            if (result.errors.length > 0) return; // 错误由 esbuild 打印，这里只报成功
            console.log('[watch] lib/index.js rebuilt');
          });
        },
      },
    ],
  });

  const clientCtx = await context({
    ...clientOptions(),
    plugins: [
      {
        name: 'wrap-client',
        setup(pluginBuild) {
          pluginBuild.onEnd(async (result) => {
            if (result.errors.length > 0) return;
            const output = result.outputFiles?.[0];
            if (!output) return;
            await writeUtf8(OUT_CLIENT, wrapClientModule(output.text));
            console.log('[watch] lib/client.js rebuilt');
          });
        },
      },
    ],
  });

  await Promise.all([hostCtx.watch(), clientCtx.watch()]);
  console.log('[watch] 监听 src/ 变化中…（Ctrl+C 退出）');
}

/** 入口：解析 --watch，决定一次性构建还是常驻监听。 */
async function main() {
  const watch = process.argv.includes('--watch');
  if (watch) {
    await watchAll();
    return;
  }
  await buildOnce();
}

main().catch((error) => {
  console.error('[build] 失败：', error && error.message ? error.message : error);
  process.exitCode = 1;
});
