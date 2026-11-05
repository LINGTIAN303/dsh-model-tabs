/**
 * ModelTabs 真 DOM 冒烟测试（开发期临时脚本，不属于发布内容）
 *
 * SSR 渲染对 useSyncExternalStore 有限制（要求 getServerSnapshot），
 * 所以改用 jsdom + react-dom/client 做真实客户端渲染，覆盖主组件关键路径：
 *   1. JSX 编译、组件挂载不抛错
 *   2. 小目录不渲染 Tab 条；大目录渲染 Provider Tab
 *   3. 点开菜单 → 选 provider → 出现 Family Tab（族数与 family.js 一致）
 *   4. 族过滤生效：列表只剩该族模型
 *   5. 点模型行 → 调用 select，reasoningEffort 取该模型默认值
 *   6. trigger 显示模型名 + 推理等级
 *
 * 用法：node .scratch/smoke-modeltabs.mjs
 */

import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

// ── jsdom 环境（必须在 require react-dom 之前建立）────────────────────────
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
globalThis.Node = dom.window.Node;
globalThis.Element = dom.window.Element;
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.localStorage = dom.window.localStorage;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// jsdom 不实现 scrollIntoView（真实浏览器有），补个空实现
dom.window.HTMLElement.prototype.scrollIntoView = function () {};

// ── primitives stub ───────────────────────────────────────────────────────
const stubPath = join(await mkdtemp(join(tmpdir(), 'mts-prim-')), 'primitives-stub.js');
await writeFile(
  stubPath,
  `import React from 'react';
const Icon = (props) => React.createElement('span', { 'data-icon': '1' });
export const IconDataOutlineRegular = Icon;
export const IconChevronDownOutlineRegular = Icon;
export const IconChevronRightOutlineRegular = Icon;
export const IconCheckOutlineRegular = Icon;
export const IconCloseFillRegular = Icon;
export const IconWarningOutlineRegular = Icon;
export const StateDot = () => React.createElement('span', { 'data-dot': '1' });
export const Input = React.forwardRef((props, ref) => React.createElement('input', { ...props, ref }));
export const MenuGroup = ({ label, children }) =>
  React.createElement('section', { 'data-menu-group': '', 'data-group-label': label },
    React.createElement('span', { 'data-menu-group-heading': '' }, label), children);
export const MenuSurface = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('div', { ...rest, ref }, children);
});
export const Toast = () => null;
export const observeStickyMenuGroups = () => () => {};
export const rankByName = (models, q) => {
  const s = String(q || '').toLowerCase();
  if (!s) return models;
  return models.filter((m) => String(m.name || m.id).toLowerCase().includes(s));
};
`,
  'utf8',
);

const outDir = join(ROOT, '.scratch', 'tmp-render');
await mkdir(outDir, { recursive: true });
const outFile = join(outDir, 'modeltabs-dom.cjs');

await build({
  entryPoints: [join(ROOT, 'src/client/ModelTabs.js')],
  outfile: outFile,
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node22',
  loader: { '.js': 'jsx' },
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  alias: { '@deepseek-ai/dsh-client-ui-primitives': stubPath },
  logLevel: 'silent',
});

const React = require('react');
const ReactDOMClient = require('react-dom/client');
const { act } = require('react-dom/test-utils');
const ModelTabs = require(outFile).default;

const failures = [];
const check = (name, ok, detail = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (ok ? '' : ' —— ' + detail));
  if (!ok) failures.push(name);
};

const t = (key, params) => {
  const dict = {
    'provider.account': 'DeepSeek 账号',
    'tabs.all': '全部',
    'tabs.providersAria': '按提供商筛选模型',
    'tabs.familiesAria': '按模型系列筛选',
    'trigger.fallback': '请选择模型',
    'trigger.loading': '正在加载模型…',
    'trigger.selectAria': '请选择模型',
    'trigger.aria': '当前模型：{model}',
    'trigger.ariaEffort': '当前模型：{model}，推理等级：{effort}',
    'menu.aria': '模型选择',
    'menu.model': '模型',
    'menu.effort': '推理等级',
    'search.placeholder': '搜索模型',
    'search.clear': '清除搜索',
    'search.empty': '没有匹配的模型',
    'status.loading': '正在加载模型…',
    'empty.models': '没有可用模型',
    'empty.efforts': '该模型没有推理等级选项',
    'error.action': '操作失败：{message}',
    'error.sessionInUse': '会话被占用',
    'warning.groupLoad': '{name} 目录加载失败：{message}',
    retry: '重试',
    'action.reload': '重新加载',
    'effort.providerDefault': '提供商默认',
  };
  let text = dict[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) text = text.replace(`{${k}}`, String(v));
  return text;
};

/** 假目录：snapshot 可变，select 记录调用。 */
function makeDirectory(groups, current = null) {
  const snapshot = {
    current,
    routable: current,
    groups,
    failures: [],
    status: 'ready',
    pending: null,
    error: null,
    retainedEffort: undefined,
  };
  const listeners = new Set();
  const calls = [];
  // current 指向会随 setCurrent 替换，getSnapshot 每次返回新对象以触发重渲染
  let value = snapshot;
  return {
    calls,
    setCurrent(next) {
      value = { ...value, current: next, routable: next };
      for (const fn of listeners) fn();
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getSnapshot: () => value,
  };
}

/** 挂载组件并返回 { container, unmount }。 */
async function mount(props) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root;
  await act(async () => {
    root = ReactDOMClient.createRoot(container);
    root.render(React.createElement(ModelTabs, props));
  });
  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

/** 在容器里按选择器找元素。 */
const find = (container, sel) => container.querySelector(sel);
// 菜单经 createPortal 渲染到 document.body，必须从 body 搜索
const findMenu = (sel) => document.body.querySelector(sel);
const findAllMenu = (sel) => [...document.body.querySelectorAll(sel)];
const findAll = (container, sel) => [...container.querySelectorAll(sel)];

// ── 数据 ──────────────────────────────────────────────────────────────────
const reasoning = {
  defaultEffort: 'high',
  efforts: [
    { id: 'high', name: 'High' },
    { id: 'max', name: 'Max' },
  ],
};

const bigGroups = [
  {
    id: 'deepseek-official',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-flash', name: 'DeepSeek-Flash', reasoning },
      { id: 'deepseek-pro', name: 'DeepSeek-Pro' },
      ...Array.from({ length: 10 }, (_, i) => ({ id: `ds-x-${i}`, name: `DeepSeek-X-${i}` })),
    ],
  },
  {
    id: 'trae',
    name: 'TRAE',
    models: [
      { id: 'glm-5.3', name: 'GLM-5.3' },
      { id: 'glm-5.2', name: 'GLM-5.2' },
      { id: 'glm-5.1', name: 'GLM-5.1' },
      { id: 'kimi-k3', name: 'Kimi-K3' },
      { id: 'kimi-k2', name: 'Kimi-K2' },
      { id: 'qwen-3.8', name: 'Qwen3.8' },
      { id: 'qwen-3.7', name: 'Qwen3.7' },
      ...Array.from({ length: 7 }, (_, i) => ({ id: `mimo-${i}`, name: `MiMo-${i}` })),
    ],
  },
];

const smallGroups = [
  { id: 'a', name: 'A', models: [{ id: 'x1', name: 'GLM-X1' }, { id: 'x2', name: 'GLM-X2' }] },
  { id: 'b', name: 'B', models: [{ id: 'y1', name: 'Kimi-Y1' }] },
];

// ── 用例 1：小目录不渲染 Tab ──────────────────────────────────────────────
{
  const dir = makeDirectory(smallGroups);
  const m = await mount({
    locked: false, available: true, directory: dir,
    load: () => {}, select: () => Promise.resolve(undefined), t,
  });
  check('小目录 trigger 存在', find(m.container, '.mt-trigger') !== null);
  await act(async () => find(m.container, '.mt-trigger').click());
  check('小目录菜单打开但不含 Tab 条', findMenu('.mt-tabs') === null);
  check('小目录菜单含 3 个模型行', findAllMenu('[role="menuitemradio"]').length === 3,
    `实际 ${findAllMenu('[role="menuitemradio"]').length}`);
  await m.unmount();
}

// ── 用例 2：大目录 → Provider Tab ────────────────────────────────────────
const dir = makeDirectory(bigGroups);
let selected = [];
const m = await mount({
  locked: false, available: true, directory: dir,
  load: () => {},
  select: (s) => { selected.push(s); return Promise.resolve({ ok: true }); },
  t,
});

check('大目录 trigger 存在', find(m.container, '.mt-trigger') !== null);

await act(async () => find(m.container, '.mt-trigger').click());
check('菜单已打开', findMenu('.mt-menu') !== null);

// 无当前选中时，官方行为是直接打开到 model pane（跳过 root 的两行）
check('无选中时直接进入 model pane', findAllMenu('.mt-cell').length === 0);

// model pane：一级 Tab
const primaryTabs = findAllMenu('.mt-tabs:not(.mt-tabsSecondary) [role="tab"]');
check('大目录渲染 Provider Tab', primaryTabs.length > 0);
check('Provider Tab = 全部 + 2 个 provider', primaryTabs.length === 3, `实际 ${primaryTabs.length}`);
check('第一个 Tab 是「全部」且选中', primaryTabs[0].getAttribute('aria-selected') === 'true');

// ── 用例 3：选 provider → Family Tab ────────────────────────────────────
const traeTab = primaryTabs.find((b) => b.textContent.includes('TRAE'));
check('找到 TRAE Tab', traeTab !== undefined);
await act(async () => traeTab.click());

const secondaryTabs = findAllMenu('.mt-tabsSecondary [role="tab"]');
const { groupByFamily } = await import('../src/client/family.js');
const traeFamilies = groupByFamily(bigGroups[1].models);
check('选中 provider 后出现 Family Tab', secondaryTabs.length > 0);
check(
  `Family Tab = 全部 + ${traeFamilies.length} 个族`,
  secondaryTabs.length === traeFamilies.length + 1,
  `实际 ${secondaryTabs.length}，族 ${traeFamilies.map((f) => f.key).join(',')}`,
);

// 列表此时应只含 TRAE 的模型
const traeRows = findAllMenu('[role="menuitemradio"]');
check('provider 过滤后只剩 TRAE 的 14 个模型', traeRows.length === 14, `实际 ${traeRows.length}`);

// ── 用例 4：族过滤 ──────────────────────────────────────────────────────
const glmTab = secondaryTabs.find((b) => b.textContent.includes('GLM'));
check('找到 GLM 族 Tab', glmTab !== undefined);
await act(async () => glmTab.click());
const glmRows = findAllMenu('[role="menuitemradio"]');
check('族过滤后只剩 GLM 的 3 个模型', glmRows.length === 3, `实际 ${glmRows.length}`);
check('列表内容全为 GLM', glmRows.every((r) => r.textContent.includes('GLM')));

// ── 用例 5：选中模型 → select 带正确 reasoningEffort ────────────────────
const first = glmRows[0];
await act(async () => first.click());
check('select 被调用一次', selected.length === 1, `实际 ${selected.length}`);
if (selected.length === 1) {
  check('provider 正确', selected[0].provider === 'trae', `实际 ${selected[0].provider}`);
  check('model 正确', selected[0].model === 'glm-5.3', `实际 ${selected[0].model}`);
  check('无 reasoning 的模型不带 reasoningEffort', selected[0].reasoningEffort === undefined,
    `实际 ${selected[0].reasoningEffort}`);
}

// ── 用例 6：trigger 显示模型名 + 推理等级 ───────────────────────────────
await act(async () => dir.setCurrent({ provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'high' }));
const triggerText = find(m.container, '.mt-trigger')?.textContent ?? '';
check('trigger 显示模型名', triggerText.includes('DeepSeek-Flash'), `实际「${triggerText}」`);
check('trigger 显示推理等级', triggerText.includes('High'), `实际「${triggerText}」`);

await m.unmount();

// ── 汇总 ──────────────────────────────────────────────────────────────────
console.log(`\n[modeltabs-smoke] ${failures.length === 0 ? 'ok  全部通过' : '失败 ' + failures.length + ' 项'}`);
if (failures.length) console.log('失败项: ' + failures.join(' / '));
process.exit(failures.length === 0 ? 0 : 1);


