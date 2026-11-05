/**
 * 客户端产物冒烟测试（开发期临时脚本，不属于发布内容）
 *
 * 目的：不打开 DSH，直接以「假 ModuleLoader + React stub」加载 lib/client.js，
 * 验证插件装配层（apply/inject/槽注册参数）是否按契约工作：
 *   1. 产物能被 factory(require) 解析，导出 apply / inject
 *   2. inject === ['slots','locale']
 *   3. apply 注册 settings.section：name/id/order/label/locale 齐全
 *   4. apply 注册 conversation.input.model：priority === -1000、locale 正确、inject 回调可解析
 *   5. 缺 sessions/modelDirectories 时退让（不注册座位槽），且设置页仍注册
 *
 * 用法：node .scratch/smoke-client.cjs
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CLIENT = path.join(ROOT, 'lib', 'client.js');

// ── React / ReactDOM stub：只提供加载期会被访问到的成员 ────────────────────
const React = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: (v) => ({ current: v }),
  useCallback: (fn) => fn,
  useId: () => 'r1',
  useSyncExternalStore: (_sub, get) => get(),
  Fragment: 'Fragment',
  // 错误边界（ModelSeat.js）继承 React.Component，stub 必须提供可继承的类
  Component: class Component {
    constructor(props) {
      this.props = props;
    }
  },
};
const ReactDOM = { createPortal: (node) => node };
const jsxRuntime = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
  Fragment: 'Fragment',
};
const primitives = {
  IconDataOutlineRegular: () => null,
  IconChevronDownOutlineRegular: () => null,
  IconChevronRightOutlineRegular: () => null,
  IconCheckOutlineRegular: () => null,
  IconCloseFillRegular: () => null,
  IconWarningOutlineRegular: () => null,
  IconSettingsOutlineRegular: () => null,
  Input: () => null,
  MenuGroup: () => null,
  MenuSurface: () => null,
  StateDot: () => null,
  Toast: () => null,
  observeStickyMenuGroups: () => () => {},
  rankByName: (rows) => rows,
};

/** 按模块 id 返回 stub；未知模块抛错（模拟宿主白名单行为）。 */
function fakeRequire(id) {
  switch (id) {
    case 'react':
      return React;
    case 'react/jsx-runtime':
      return jsxRuntime;
    case 'react-dom':
      return ReactDOM;
    case 'react-dom/client':
      return { createRoot: () => ({ render() {}, unmount() {} }) };
    case '@deepseek-ai/dsh-client-ui-primitives':
      return primitives;
    default:
      throw new Error(`smoke: unexpected require("${id}")`);
  }
}

// ── 假的 __ModuleLoader__：收集 factory，稍后手动执行 ──────────────────────
const loaded = [];
globalThis.window = globalThis;
globalThis.Symbol = Symbol;
globalThis.__ModuleLoader__ = {
  load(entry) {
    loaded.push(entry);
  },
};

// ── 假的 cordis ctx：只记录注册行为 ────────────────────────────────────────
function makeCtx({ withModelServices = true } = {}) {
  const calls = { sections: [], seats: [], injects: [], effects: [] };
  // 注入的服务在 cordis 里是 ctx 的属性（scope.modelDirectories / scope.sessions）
  const services = {
    sessions: { subagentAddress: () => undefined },
    modelDirectories: {
      directoryFor: () => ({
        store: { subscribe() {}, getSnapshot: () => ({ groups: [] }) },
        load: async () => {},
        select: async () => ({ ok: true }),
      }),
    },
  };
  const scope = {
    ...services,
    slots: {
      inject: (key, thunk) => {
        calls.injects.push(key);
        // slots.inject 的语义是「声明出现后执行 thunk」；这里立即执行以便观察
        if (key === 'settings.section' || (key === 'conversation.input.model' && withModelServices)) {
          thunk();
        }
      },
      register: (options, component) => {
        const record = { options, component };
        if (options.name === 'settings.section') calls.sections.push(record);
        else calls.seats.push(record);
        return () => {};
      },
    },
    get: (name) => {
      if (name === 'sessions') return { subagentAddress: () => undefined };
      if (name === 'modelDirectories') {
        return {
          directoryFor: () => ({
            store: { subscribe() {}, getSnapshot: () => ({ groups: [] }) },
            load: async () => {},
            select: async () => ({ ok: true }),
          }),
        };
      }
      return undefined;
    },
  };
  const ctx = {
    locale: {
      register: (ns, dicts) => {
        calls.effects.push(`locale.register(${ns}, keys=${Object.keys(dicts.zh).length})`);
        return () => {};
      },
      bind: (ns) => (key, params) => (params ? `${ns}:${key}:${JSON.stringify(params)}` : `${ns}:${key}`),
    },
    slots: scope.slots,
    effect: (fn, label) => {
      calls.effects.push(`effect(${label})`);
      fn();
      return () => {};
    },
    inject: (deps, callback) => {
      calls.injects.push(`ctx.inject(${deps.join(',')})`);
      // 依赖齐备才执行回调：缺服务时完全不调用 → 模拟退让
      if (withModelServices) callback(scope);
    },
  };
  return { ctx, calls };
}

// ── 执行 ───────────────────────────────────────────────────────────────────
const code = fs.readFileSync(CLIENT, 'utf8');
// 产物是浏览器脚本（裸 window.xxx），用 Function 执行避免 Node 的 ESM/CJS 判定
new Function('window', 'Symbol', code)(globalThis, Symbol);

const entry = loaded[0];
const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

check(loaded.length === 1, `应注册 1 个模块，实际 ${loaded.length}`);
check(entry && entry.id === 'dsh-model-tabs', `模块 id 应为 dsh-model-tabs，实际 ${entry && entry.id}`);

const mod = entry.factory(fakeRequire);
check(typeof mod.apply === 'function', '导出 apply 不是函数');
check(Array.isArray(mod.inject), '导出 inject 不是数组');
check(
  JSON.stringify(mod.inject) === JSON.stringify(['slots', 'locale']),
  `inject 应为 ['slots','locale']，实际 ${JSON.stringify(mod.inject)}`,
);

// 情形 A：服务齐备
{
  const { ctx, calls } = makeCtx({ withModelServices: true });
  mod.apply(ctx);

  check(calls.sections.length === 1, `settings.section 应注册 1 次，实际 ${calls.sections.length}`);
  const section = calls.sections[0];
  check(section.options.name === 'settings.section', 'section 槽名不对');
  check(section.options.id === 'model-tabs', `section id 应为 model-tabs，实际 ${section.options.id}`);
  check(typeof section.options.order === 'number', 'section 缺 order（list 槽必需）');
  check(typeof section.options.label === 'function', 'section label 应为 thunk');
  check(section.options.locale === 'model-tabs', `section locale 应为 model-tabs，实际 ${section.options.locale}`);
  check(typeof section.component === 'function', 'section component 不是组件');

  check(calls.seats.length === 1, `模型座位应注册 1 次，实际 ${calls.seats.length}`);
  const seat = calls.seats[0];
  check(seat.options.name === 'conversation.input.model', '座位槽名不对');
  check(seat.options.priority === -1000, `座位 priority 应为 -1000，实际 ${seat.options.priority}`);
  check(seat.options.locale === 'model-tabs', `座位 locale 应为 model-tabs，实际 ${seat.options.locale}`);
  check(typeof seat.options.inject === 'function', '座位 inject 应为函数');
  check(typeof seat.component === 'function', '座位 component 不是组件');

  // 注入面：按 sessionId 解析目录
  const injected = seat.options.inject('s-1');
  check(injected.available === true, 'inject 应给出 available=true');
  check(typeof injected.directory === 'object', 'inject 缺 directory store');
  check(typeof injected.load === 'function', 'inject 缺 load');
  check(typeof injected.select === 'function', 'inject 缺 select');

  check(
    calls.effects.some((line) => line.startsWith('locale.register(model-tabs')),
    '未注册 locale 字典',
  );
}

// 情形 B：缺 modelDirectories/sessions → 退让，但设置页仍在
{
  const { ctx, calls } = makeCtx({ withModelServices: false });
  mod.apply(ctx);
  check(calls.seats.length === 0, '服务缺失时不应注册模型座位');
  check(calls.sections.length === 1, '服务缺失时设置页仍应注册');
}

if (failures.length > 0) {
  console.error('[smoke] 失败项：');
  for (const item of failures) console.error(`  - ${item}`);
  process.exit(1);
}
console.log('[smoke] ok  插件装配层契约全部通过（含服务缺失退让）');
