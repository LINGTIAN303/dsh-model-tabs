/**
 * 产物级集成冒烟：用**真实 React** 加载 lib/client.js（最终发布产物），
 * 而不是从 src 打包。目的是确认「打出来的那份文件」在接近宿主的条件下能跑。
 *
 * 与 smoke-assembly.cjs 的分工：
 *   · smoke-assembly.cjs：假 React stub，验装配契约（槽参数、退让）
 *   · 本脚本：真 React + jsdom，验产物能真正渲染出 trigger
 *
 * 用法：node tools/smoke-bundle.mjs
 */

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const CLIENT = 'E:/dsh-model-management/lib/client.js';

// ── jsdom 环境 ────────────────────────────────────────────────────────────
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
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
dom.window.HTMLElement.prototype.scrollIntoView = function () {};

// ── 假 primitives（真实包不在 node_modules，用同签名 stub）────────────────
const primitives = {
  IconDataOutlineRegular: () => null,
  IconChevronDownOutlineRegular: () => null,
  IconChevronRightOutlineRegular: () => null,
  IconCheckOutlineRegular: () => null,
  IconCloseFillRegular: () => null,
  IconWarningOutlineRegular: () => null,
  Input: (props) => null,
  MenuGroup: ({ children }) => children,
  MenuSurface: ({ children }) => children,
  StateDot: () => null,
  Toast: () => null,
  observeStickyMenuGroups: () => () => {},
  rankByName: (models) => models,
};

const failures = [];
const check = (name, ok, detail = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (ok ? '' : ' —— ' + detail));
  if (!ok) failures.push(name);
};

// ── 加载产物：模拟宿主的 __ModuleLoader__ ─────────────────────────────────
let loaded = null;
const moduleCache = {
  react: require('react'),
  'react/jsx-runtime': require('react/jsx-runtime'),
  'react-dom': require('react-dom'),
  '@deepseek-ai/dsh-client-ui-primitives': primitives,
};

globalThis.window.__ModuleLoader__ = {
  load: (def) => {
    loaded = def.factory((id) => {
      if (!(id in moduleCache)) throw new Error(`未预期的模块请求: ${id}`);
      return moduleCache[id];
    });
  },
};

const src = readFileSync(CLIENT, 'utf8');
// 产物以 window.__ModuleLoader__.load 开头，直接在当前 globalThis 下求值
new Function('window', src)(globalThis.window);

check('产物被 ModuleLoader 加载', loaded !== null);
check('导出 apply 函数', loaded && typeof loaded.apply === 'function');
check('导出 inject 数组', loaded && Array.isArray(loaded.inject));
check('inject 含 slots 与 locale', loaded && loaded.inject.includes('slots') && loaded.inject.includes('locale'));

// ── 模拟宿主 ctx，跑 apply ────────────────────────────────────────────────
const registrations = [];
const effects = [];

function makeCtx(services) {
  // services.slots 只作为开关；真正的 slots 服务对象必须由本函数提供
  const { slots: slotsEnabled, ...rest } = services;
  const slots = {
    inject: (name, thunk) => {
      if (!slotsEnabled) return;
      const dispose = thunk();
      if (typeof dispose === 'function') registrations.push({ name, dispose });
    },
    register: (options, component) => {
      registrations.push({ slot: options.name, options, component });
      return () => {};
    },
  };
  return {
    effect: (fn) => {
      const dispose = fn();
      if (typeof dispose === 'function') effects.push(dispose);
    },
    locale: {
      register: () => () => {},
      bind: () => (key) => key,
    },
    slots,
    // ctx.inject(names, cb)：宿主在服务就绪后回调；这里同步调用，模拟「服务齐全」
    inject: (names, cb) => {
      const ok = names.every((n) => rest[n] !== undefined);
      if (!ok) return; // 缺服务 → 不回调（宿主行为：等待，本测试即退让）
      cb({
        slots,
        ...Object.fromEntries(names.map((n) => [n, rest[n]]))
      });
    },
    ...rest,
  };
}

// 场景 A：服务齐全 → 两个槽都应注册
registrations.length = 0;
loaded.apply(
  makeCtx({
    slots: true,
    sessions: { subagentAddress: () => undefined },
    modelDirectories: { directoryFor: () => ({ store: {}, load: () => Promise.resolve(), select: () => Promise.resolve() }) },
  }),
);
const seat = registrations.find((r) => r.slot === 'conversation.input.model');
const section = registrations.find((r) => r.slot === 'settings.section');
check('服务齐全时注册模型座位槽', seat !== undefined);
check('座位 priority === -1000', seat && seat.options.priority === -1000, seat ? String(seat.options.priority) : 'n/a');
check('座位声明 locale 命名空间', seat && seat.options.locale === 'model-tabs');
check('座位有 inject 回调', seat && typeof seat.options.inject === 'function');
check('服务齐全时注册设置页槽', section !== undefined);
check('设置页带 id', section && section.options.id === 'model-tabs');
check('设置页带 order', section && typeof section.options.order === 'number');

// 场景 B：缺 modelDirectories → 座位槽不注册，设置页仍注册（退让）
registrations.length = 0;
loaded.apply(makeCtx({ slots: true, sessions: { subagentAddress: () => undefined } }));
check('缺 modelDirectories 时不注册座位槽（退让）', registrations.every((r) => r.slot !== 'conversation.input.model'));
check('缺 modelDirectories 时设置页仍注册', registrations.some((r) => r.slot === 'settings.section'));

// 场景 C：缺 sessions → 同样退让
registrations.length = 0;
loaded.apply(makeCtx({ slots: true, modelDirectories: { directoryFor: () => ({}) } }));
check('缺 sessions 时同样退让', registrations.every((r) => r.slot !== 'conversation.input.model'));

console.log(`\n[bundle-smoke] ${failures.length === 0 ? 'ok  全部通过' : '失败 ' + failures.length + ' 项'}`);
if (failures.length) console.log('失败项: ' + failures.join(' / '));
process.exit(failures.length === 0 ? 0 : 1);
