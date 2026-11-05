/**
 * ModelTabs —— composer 的模型座位（`conversation.input.model` 槽）
 *
 * 相对官方 `ModelSelect` 的差异（其余行为尽量对齐）：
 *   1. 大目录时，模型列表上方多出两级 Tab：
 *        Provider Tab（一级，按 provider.id 分类）
 *        Family  Tab（二级，按模型名前缀族分类，仅在选定具体 provider 后出现）
 *      小目录（阈值以下）不出现 Tab，行为与官方平铺一致。
 *   2. 两级 Tab 与搜索叠加过滤：先 Tab 收敛，再在结果内搜索。
 *   3. 族规则来自 config.js，用户可在设置页编辑。
 *
 * 结构（沿用官方的 root / model / effort 三 pane）：
 *   root   : 「模型」行 → drill model ；「推理等级」行 → drill effort
 *   model  : Provider Tab + Family Tab + 搜索 + 列表 + 状态/错误
 *   effort : 推理档位列表（provider default + 该模型 advertised 的档位）
 *
 * 视觉基线取自官方 ModelSelect.module.css（token 与尺寸逐项对齐），
 * 保证换装后 trigger 与菜单的观感不跳变。
 *
 * 数据流：props 由槽 owner 注入（locked + directory store/verbs），
 * 组件只读 store、只调 select，不直接碰 Remote。
 */

import React from 'react';
import { createPortal } from 'react-dom';
import {
  IconDataOutlineRegular,
  IconChevronDownOutlineRegular,
  IconChevronRightOutlineRegular,
  IconCheckOutlineRegular,
  IconCloseFillRegular,
  IconWarningOutlineRegular,
  Input,
  MenuGroup,
  MenuSurface,
  StateDot,
  Toast,
  observeStickyMenuGroups,
  rankByName,
} from '@deepseek-ai/dsh-client-ui-primitives';
import { loadConfig, subscribeConfig, effectiveRules } from './config.js';
import { groupByFamily, classifyFamily } from './family.js';

// ── 样式 ────────────────────────────────────────────────────────────────────
// 前缀 mt- 避免与官方类名冲突；颜色全部走 --dsw-alias-* token。
const CSS = [
  '.mt-root{min-width:0;position:relative}',
  // trigger：与官方 _9r0rkG_trigger 逐项对齐
  '.mt-trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:400;line-height:20px;display:flex}',
  '.mt-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '.mt-trigger:focus-visible:not([data-selection-focus]){box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}',
  '.mt-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
  '.mt-triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}',
  '.mt-triggerEffort{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);flex-shrink:1000;overflow:hidden}',
  '.mt-triggerIcon{display:var(--dsh-composer-model-icon-display,none);flex:none}',
  '.mt-triggerLabel,.mt-triggerEffort{display:var(--dsh-composer-model-text-display,block)}',
  '.mt-chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}',
  '.mt-chevronOpen{transform:rotate(180deg)}',
  // 菜单外壳：与官方 _9r0rkG_menu 对齐（小目录走官方 420x360）
  // Tab 模式下宽度固定（见 .mt-menuWithTabs）：不同 provider/族数量下菜单宽度不再抖动，
  '.mt-menu{z-index:1100;--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsh-scrollbar-hover-l2);border:0;flex-direction:column;padding:4px;display:flex;position:fixed;overflow:hidden}',
  // 大目录（Tab 模式）尺寸 500x470：底部两条 Tab + 搜索框占 ~90px 后列表仍可容纳 ~10 行；
  // 小目录不含 Tab 条，不会命中这条规则，保持官方观感。
  '.mt-menuWithTabs{width:min(500px,100vw - 32px);min-width:min(500px,100vw - 32px);max-width:min(500px,100vw - 32px);max-height:min(470px,100vh - 96px)}',
  '.mt-status,.mt-empty{color:var(--dsw-alias-label-tertiary);padding:8px;font-size:12px;line-height:18px}',
  '.mt-error,.mt-warning{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:3px;padding:6px 7px;font-size:11px;line-height:16px;display:flex}',
  '.mt-warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}',
  '.mt-retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}',
  '.mt-searchRow{flex-shrink:0;margin:2px 0 3px;position:relative}',
  '.mt-searchRow .mt-search{border-radius:var(--dsw-radius-md);background:0 0;border:0 solid #0000;height:auto;padding:5px 7px;display:flex}',
  '.mt-searchRow .mt-searchWithQuery{padding-right:34px}',
  '.mt-searchClear{corner-shape:round;width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;padding:0;display:inline-flex;position:absolute;top:50%;right:4px;transform:translateY(-50%)}',
  '.mt-searchClear:hover,.mt-searchClear:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}',
  '.mt-searchRow .mt-search:focus-within{border-color:#0000}',
  '.mt-searchRow .mt-search input{padding:0;font-size:12px;line-height:normal}',
  '.mt-searchRow .mt-search input::placeholder{color:var(--dsw-alias-label-caption)}',
  '.mt-groups{min-height:0;overflow-y:auto}',
  '.mt-option{box-sizing:border-box;border-radius:var(--dsw-radius-md);width:auto;min-width:100%;min-height:34px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:6px;padding:5px 7px;display:flex}',
  '.mt-option:not(.mt-modelOption):hover:not(:disabled),.mt-option:focus-visible,.mt-optionActive:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
  '.mt-option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
  '.mt-optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}',
  '.mt-modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:400;line-height:18px;overflow:hidden}',
  '.mt-check{color:var(--dsw-alias-label-primary);flex:0 0 14px;place-items:center;display:grid}',
  '.mt-check svg{width:14px;height:14px}',
  '.mt-cell{box-sizing:border-box;border-radius:var(--dsw-radius-md);width:auto;min-width:100%;height:34px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;outline:none;align-items:center;gap:6px;padding:0 8px;font-size:13px;line-height:20px;display:flex}',
  '.mt-cell:hover,.mt-cell:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}',
  '.mt-cellLabel{white-space:nowrap;flex:none}',
  '.mt-cellValue{text-overflow:ellipsis;white-space:nowrap;text-align:right;min-width:0;color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}',
  '.mt-cellChevron{width:12px;height:12px;color:var(--dsw-alias-menu-icon);flex:none}',
  // 两级 Tab 条：横向可滚动，不换行；族条在上（无边框），提供商条钉在最底边（上边框与列表分隔）
  '.mt-tabs{display:flex;gap:2px;padding:3px 4px 2px;flex-shrink:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;border-top:.5px solid var(--dsw-alias-border-l2)}',
  '.mt-tabs::-webkit-scrollbar{display:none}',
  // 族条：出现在提供商条上方，自身用上边框与列表分隔，不带下边框
  '.mt-tabsSecondary{border-top:.5px solid var(--dsw-alias-border-l2);border-bottom:0}',
  '.mt-tab{appearance:none;border:none;background:0 0;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:12px;line-height:17px;height:24px;padding:0 8px;border-radius:var(--dsw-radius-sm);cursor:pointer;white-space:nowrap;flex:none;align-items:center;gap:5px;display:inline-flex;position:relative}',
  '.mt-tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
  '.mt-tab[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}',
  '.mt-tab:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}',
  '.mt-tabCount{color:var(--dsw-alias-label-caption);font-size:11px;font-weight:400;font-variant-numeric:tabular-nums}',
  '.mt-tab[aria-selected=true] .mt-tabCount{color:var(--dsw-alias-label-secondary)}',
  '.mt-tabScrollHint{display:flex;align-items:center;justify-content:center;flex:none;width:16px;color:var(--dsw-alias-label-caption);pointer-events:none}',
].join('\n');

/** 未放置时的测量样式：hidden 但仍参与布局，供 MenuSurface 量尺寸。 */
const MEASURE_STYLE = { visibility: 'hidden', left: 0, top: 0 };

/** 表单容器左右边距，菜单定位时避免贴边。 */
const MARGIN = 12;

/** 搜索结果为空时用于判断「目录本身是否为空」。 */
const EMPTY_GROUPS = [];

/**
 * 判断是否走 Tab 模式。
 * 两个阈值任一命中即启用；阈值来自配置，用户可调。
 * @param {Array<{models:Array}>} groups provider 分组
 * @param {{totalModels:number,perProvider:number}} thresholds
 * @returns {boolean}
 */
function needsTabs(groups, thresholds) {
  if (!Array.isArray(groups) || groups.length === 0) return false;
  const totalThreshold = Number.isFinite(thresholds?.totalModels) ? thresholds.totalModels : 20;
  const providerThreshold = Number.isFinite(thresholds?.perProvider) ? thresholds.perProvider : 30;
  let total = 0;
  let maxPerProvider = 0;
  for (const group of groups) {
    const count = Array.isArray(group.models) ? group.models.length : 0;
    total += count;
    if (count > maxPerProvider) maxPerProvider = count;
  }
  return total > totalThreshold || maxPerProvider > providerThreshold;
}

/**
 * provider 排序：账号 → 官方 → 其它按目录序（与官方 orderModelProviders 同口径）。
 * @param {Array} groups
 * @returns {Array}
 */
function orderProviders(groups) {
  // 用 slice().sort() 而非 toSorted：后者在旧版 Chromium 缺失，且此处无需不可变保证
  return groups.slice().sort(
    (left, right) =>
      (left.id === 'deepseek-account' ? 0 : left.id === 'deepseek-official' ? 1 : 2) -
      (right.id === 'deepseek-account' ? 0 : right.id === 'deepseek-official' ? 1 : 2),
  );
}

/**
 * 可横向滚动的 Tab 条。
 * 用 role=tablist + 方向键左右切换，Enter/Space 选中（浏览器原生行为）。
 * @param {object} props
 * @param {Array<{key:string,label:string,count:number}>} props.items
 * @param {string|null} props.value 当前选中 key，null 表示「全部」
 * @param {(key:string|null)=>void} props.onChange
 * @param {string} props.ariaLabel
 * @param {boolean} [props.secondary] 是否为二级（族）Tab 条
 * @returns {React.ReactElement}
 */
function TabStrip({ items, value, onChange, ariaLabel, secondary = false }) {
  const listRef = React.useRef(null);

  // 选中项滚进视野：Tab 多了以后不滚过去用户看不到自己选了哪个
  React.useEffect(() => {
    const list = listRef.current;
    if (list === null) return;
    const selected = list.querySelector('[aria-selected="true"]');
    if (selected === null) return;
    selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value, items]);

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation(); // 别让根级的模型列表上下键逻辑抢走
    const current = items.findIndex((item) => item.key === value);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = items[(current + delta + items.length) % items.length];
    if (next === undefined) return;
    onChange(next.key);
    // 焦点跟着选中项走：roving tabindex 下只有选中项 tabIndex=0，
    // 不主动移焦会让焦点留在旧按钮上，方向键从此失灵
    queueMicrotask(() => {
      const list = listRef.current;
      if (list === null) return;
      const buttons = list.querySelectorAll('[role="tab"]');
      buttons[(current + delta + items.length) % items.length]?.focus();
    });
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={secondary ? 'mt-tabs mt-tabsSecondary' : 'mt-tabs'}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => (
        <button
          key={item.key ?? '__all__'}
          type="button"
          role="tab"
          className="mt-tab"
          aria-selected={item.key === value}
          tabIndex={item.key === value ? 0 : -1}
          onClick={() => onChange(item.key)}
        >
          {item.label}
          {item.count !== undefined && <span className="mt-tabCount">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * 渲染 composer 的模型座位。
 * @param {object} props 槽注入：owner share（locked）+ 目录 store/verbs + locale
 * @returns {React.ReactElement|null}
 */
export default function ModelTabs({ locked, available, directory, load, select, t }) {
  // 目录快照：与官方一样用 uSES 直连 store
  const state = React.useSyncExternalStore(
    (fn) => directory.subscribe(fn),
    () => directory.getSnapshot(),
  );

  const [open, setOpen] = React.useState(false);
  const [pane, setPane] = React.useState('root');
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(null);
  const [selectionFocus, setSelectionFocus] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [menuPos, setMenuPos] = React.useState(null);
  // 两级 Tab 的选中值：null = 全部
  const [providerTab, setProviderTab] = React.useState(null);
  const [familyTab, setFamilyTab] = React.useState(null);

  const lastActionRef = React.useRef('load');
  const toastSeq = React.useRef(0);
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const groupsRef = React.useRef(null);
  const itemRefs = React.useRef([]);
  const paneFocus = React.useRef(null);
  const id = React.useId();

  // 配置：初始同步读一次，之后订阅变化（设置页保存后即时生效）
  const [config, setConfig] = React.useState(() => loadConfig());
  React.useEffect(() => subscribeConfig(() => setConfig(loadConfig())), []);

  const rules = React.useMemo(() => effectiveRules(config), [config]);
  const thresholds = config.thresholds;
  const accountProviderName = t('provider.account');

  // provider 分组：统一补上 provider 显示名（账号 provider 用本地化名）
  const groups = React.useMemo(
    () =>
      orderProviders(state.groups).map((group) => ({
        ...group,
        provider: {
          id: group.id,
          name: group.id === 'deepseek-account' ? accountProviderName : group.name,
        },
      })),
    [state.groups, accountProviderName],
  );

  const choices = React.useMemo(
    () =>
      groups.flatMap((group) =>
        group.models.map((model) => ({
          group,
          model,
          selection: {
            provider: group.id,
            model: model.id,
            ...(model.reasoning?.defaultEffort === undefined
              ? {}
              : { reasoningEffort: model.reasoning.defaultEffort }),
          },
        })),
      ),
    [groups],
  );

  const useTabs = React.useMemo(
    () => needsTabs(groups, thresholds),
    [groups, thresholds],
  );
  const showSearch = choices.length > 4;

  // ── 过滤链：provider Tab → family Tab → 搜索 ──────────────────────────────
  // 一级 Tab 的条目：全部 + 每个 provider（带模型数）
  const providerTabItems = React.useMemo(() => {
    if (!useTabs) return EMPTY_GROUPS;
    return [
      { key: null, label: t('tabs.all'), count: choices.length },
      ...groups.map((group) => ({
        key: group.id,
        label: group.provider.name,
        count: group.models.length,
      })),
    ];
  }, [useTabs, groups, choices.length, t]);

  // 选中 provider 后它的模型全集（族 Tab 与列表都以它为基准）
  const scopedGroups = React.useMemo(
    () => (providerTab === null ? groups : groups.filter((group) => group.id === providerTab)),
    [groups, providerTab],
  );

  // 二级 Tab 的条目：仅当选中了具体 provider 时才有意义
  const familyTabItems = React.useMemo(() => {
    if (!useTabs || providerTab === null) return EMPTY_GROUPS;
    const families = groupByFamily(
      scopedGroups.flatMap((group) => group.models),
      rules,
    );
    return [
      { key: null, label: t('tabs.all'), count: families.reduce((sum, f) => sum + f.models.length, 0) },
      ...families.map((family) => ({
        key: family.key,
        label: family.label,
        count: family.models.length,
      })),
    ];
  }, [useTabs, providerTab, scopedGroups, rules, t]);

  // 二级 Tab 的生效值：provider 切换后旧的族 key 可能已不存在，
  // 这里即时校验，避免在「provider 已变、重置 effect 尚未执行」的那一帧按旧族过滤出空列表
  const activeFamily =
    providerTab === null || familyTab === null
      ? null
      : familyTabItems.some((item) => item.key === familyTab)
        ? familyTab
        : null;

  const filteredGroups = React.useMemo(() => {
    const trimmed = showSearch ? query.trim() : '';
    return scopedGroups
      .map((group) => {
        let models = group.models;
        if (activeFamily !== null) {
          // 族过滤：逐模型判族，与 Tab 的族集合同一套规则
          models = models.filter((model) => classifyFamily(model.name ?? model.id, rules).key === activeFamily);
        }
        return { ...group, models: rankByName(models, trimmed) };
      })
      .filter((group) => group.models.length > 0);
  }, [scopedGroups, activeFamily, rules, query, showSearch]);

  const visibleModels = React.useMemo(
    () =>
      filteredGroups.flatMap((group) =>
        group.models.map((model) => ({ provider: group.id, model: model.id })),
      ),
    [filteredGroups],
  );

  const currentVisibleIndex = visibleModels.findIndex(
    (model) =>
      model.provider === state.current?.provider && model.model === state.current.model,
  );
  const activeModelIndex = Math.min(
    highlightedIndex ?? Math.max(0, currentVisibleIndex),
    visibleModels.length - 1,
  );

  const currentChoice =
    choices[
      state.current === null
        ? -1
        : choices.findIndex(
            (c) =>
              c.selection.provider === state.current?.provider &&
              c.selection.model === state.current.model,
          )
    ];
  const reasoning = currentChoice?.model.reasoning;
  const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
  const effortLabel =
    currentChoice === undefined
      ? undefined
      : reasoning === undefined
        ? state.retainedEffort
        : effectiveEffort === undefined
          ? t('effort.providerDefault')
          : (reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort);

  const effortChoices = React.useMemo(
    () =>
      reasoning === undefined
        ? []
        : [
            ...(reasoning.defaultEffort === undefined
              ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }]
              : []),
            ...reasoning.efforts.map((effort) => ({
              key: `effort:${effort.id}`,
              effort: effort.id,
              label: effort.name,
            })),
          ],
    [reasoning, t],
  );

  const { pending } = state;
  const busy = pending !== null;

  const reload = () => {
    lastActionRef.current = 'load';
    load();
  };

  // ── 交互 ────────────────────────────────────────────────────────────────
  // 点击外部关闭：菜单在 portal 里，要同时排除 trigger 与菜单
  React.useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (rootRef.current?.contains(event.target) === true) return;
      if (menuRef.current?.contains(event.target) === true) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [open]);

  // 小目录 / 未启用 Tab 时清掉 Tab 状态，避免切回大目录时残留
  React.useLayoutEffect(() => {
    if (!useTabs) {
      setProviderTab(null);
      setFamilyTab(null);
    }
  }, [useTabs]);

  // provider 切换后重置族选中
  React.useLayoutEffect(() => {
    setFamilyTab(null);
  }, [providerTab]);

  // 焦点安置：drill 进 model pane 时聚焦搜索（有搜索框）或当前行
  React.useEffect(() => {
    const intent = paneFocus.current;
    paneFocus.current = null;
    if (!open || intent === null) return;
    if (intent === 'drill') {
      if (pane === 'model' && showSearch) {
        searchRef.current?.focus();
        return;
      }
      (
        menuRef.current?.querySelector('[role="menuitemradio"][aria-checked="true"]:not([disabled])') ??
        itemRefs.current.find((item) => item !== null && !item.disabled) ??
        triggerRef.current
      )?.focus();
      return;
    }
    const cell = itemRefs.current[intent === 'effort' ? 1 : 0];
    (cell !== null && cell !== undefined && !cell.disabled ? cell : triggerRef.current)?.focus();
  }, [open, pane, showSearch]);

  // 吸顶分组头：仅平铺模式（未启用 Tab 或 Tab 选了全部）才需要
  React.useEffect(() => {
    const viewport = groupsRef.current;
    if (viewport === null) return;
    return observeStickyMenuGroups(viewport);
  }, [available, open, pane, filteredGroups]);

  // 高亮行滚进视野
  React.useLayoutEffect(() => {
    if (open && pane === 'model' && activeModelIndex >= 0) {
      itemRefs.current[activeModelIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, pane, activeModelIndex, visibleModels]);

  // 菜单定位：贴着 trigger 上方右对齐，越界时夹回窗口内
  React.useLayoutEffect(() => {
    if (!available || !open) {
      setMenuPos(null);
      return;
    }
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect === undefined) return;
      const lw = menuRef.current?.offsetWidth ?? 0;
      const lh = menuRef.current?.offsetHeight ?? 0;
      let x = rect.right - lw;
      let y = rect.top - 8 - lh;
      if (lw > 0) x = Math.min(Math.max(x, MARGIN), window.innerWidth - lw - MARGIN);
      if (lh > 0) y = Math.min(Math.max(y, MARGIN), window.innerHeight - lh - MARGIN);
      setMenuPos({ left: x, top: y });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    const menu = menuRef.current;
    const observer = typeof ResizeObserver !== 'undefined' && menu !== null ? new ResizeObserver(place) : null;
    if (menu !== null) observer?.observe(menu);
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [available, open, pane, state, query, providerTab, activeFamily]);

  if (!available) return null;

  const show = () => {
    setSelectionFocus(false);
    triggerRef.current?.focus();
    setQuery('');
    setHighlightedIndex(null);
    if (currentChoice === undefined) paneFocus.current = 'drill';
    setPane(currentChoice === undefined ? 'model' : 'root');
    setOpen(true);
    reload();
  };

  const changeQuery = (next) => {
    setQuery(next);
    setHighlightedIndex(0);
  };

  const close = (restoreFocus = false) => {
    setOpen(false);
    setPane('root');
    if (restoreFocus) {
      queueMicrotask(() => triggerRef.current?.focus());
    }
  };

  const closeAfterSelection = () => {
    setSelectionFocus(true);
    close(true);
  };

  const drill = (next) => {
    setQuery('');
    setHighlightedIndex(null);
    paneFocus.current = 'drill';
    setPane(next);
  };

  const back = (from) => {
    paneFocus.current = from;
    setPane('root');
  };

  const moveFocus = (offset) => {
    const items = itemRefs.current.filter((item) => item !== null);
    if (items.length === 0) return;
    const active = items.findIndex((item) => item === document.activeElement);
    items[
      active === -1
        ? offset > 0
          ? 0
          : items.length - 1
        : (active + offset + items.length) % items.length
    ]?.focus();
  };

  const onRootKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      if (pane !== 'root' && currentChoice !== undefined) back(pane);
      else close(true);
      return;
    }
    if (!open) return;
    // 搜索模式：上下键循环高亮结果，不移动焦点
    if (pane === 'model' && showSearch && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      if (!busy && visibleModels.length > 0) {
        setHighlightedIndex(
          (activeModelIndex + (event.key === 'ArrowDown' ? 1 : -1) + visibleModels.length) %
            visibleModels.length,
        );
        searchRef.current?.focus();
      }
      return;
    }
    if (
      pane === 'model' &&
      showSearch &&
      event.target instanceof HTMLInputElement &&
      (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey))
    ) {
      if (event.key === 'Tab' && visibleModels.length === 0) return;
      event.preventDefault();
      const highlighted = visibleModels[activeModelIndex];
      if (!busy && highlighted !== undefined) choose(highlighted);
      return;
    }
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        event.preventDefault();
        if (pane !== 'root' && currentChoice !== undefined) back(pane);
        else close(true);
        return;
      }
      const focused = document.activeElement;
      const rows = itemRefs.current.filter((item) => item !== null);
      if (focused instanceof HTMLButtonElement && rows.includes(focused)) {
        event.preventDefault();
        focused.click();
        return;
      }
      if (focused !== triggerRef.current) return;
      event.preventDefault();
      if (pane === 'model' && showSearch) {
        setHighlightedIndex(null);
        searchRef.current?.focus();
        return;
      }
      (
        menuRef.current?.querySelector('[role="menuitemradio"][aria-checked="true"]:not([disabled])') ??
        rows.find((item) => !item.disabled)
      )?.focus();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(event.key === 'ArrowDown' ? 1 : -1);
    }
  };

  const onBlur = (event) => {
    if (
      event.relatedTarget instanceof Node &&
      (rootRef.current?.contains(event.relatedTarget) === true ||
        menuRef.current?.contains(event.relatedTarget) === true)
    ) {
      return;
    }
    close();
  };

  const settleSelection = (result) => {
    if (result === undefined) return;
    if (result.ok) {
      if (rootRef.current !== null) closeAfterSelection();
      return;
    }
    const { error } = result;
    toastSeq.current += 1;
    setToast({
      seq: toastSeq.current,
      text:
        error.code === 'session/writer-held'
          ? t('error.sessionInUse')
          : t('error.action', { message: `${error.code}: ${error.message}` }),
    });
  };

  const submit = (selection) => {
    lastActionRef.current = 'select';
    setSelectionFocus(true);
    triggerRef.current?.focus();
    select(selection).then(settleSelection);
  };

  const choose = (selection) => {
    if (
      state.current?.provider === selection.provider &&
      state.current.model === selection.model
    ) {
      closeAfterSelection();
      return;
    }
    submit(selection);
  };

  const chooseEffort = (effort) => {
    if (state.current === null) return;
    if (effectiveEffort === effort) {
      closeAfterSelection();
      return;
    }
    submit({
      provider: state.current.provider,
      model: state.current.model,
      ...(effort === undefined ? {} : { reasoningEffort: effort }),
    });
  };

  const waiting = currentChoice === undefined && state.status === 'loading';
  const modelLabel = waiting
    ? t('trigger.loading')
    : (currentChoice?.model.name ?? t('trigger.fallback'));
  const triggerLabel = effortLabel === undefined ? modelLabel : `${modelLabel} · ${effortLabel}`;
  const triggerAria = waiting
    ? t('trigger.loading')
    : currentChoice === undefined
      ? t('trigger.selectAria')
      : effortLabel === undefined
        ? t('trigger.aria', { model: modelLabel })
        : t('trigger.ariaEffort', { model: modelLabel, effort: effortLabel });

  // 模型名渲染。
  // 官方在此处会走 `conversation.input.model.label` 子槽，但该子槽的声明由原生 entry
  // 独占（SlotCore 对同一子槽的重复声明直接抛错），而渲染未声明的子槽又会抛
  // SlotOwnershipError —— 两条路都不通，因此这里退化为直接显示模型名。
  const renderModelLabel = (provider, model, placement, selected) => (
    <span data-provider-id={provider.id} data-model-id={model.id}>
      {model.name}
    </span>
  );

  // 每次渲染重建 ref 索引：上一次渲染的行数可能更多，不重置会留下已卸载的陈旧节点
  itemRefs.current = [];
  let itemIndex = 0;
  let modelIndex = 0;
  const itemRef = () => {
    const at = itemIndex++;
    return (node) => {
      itemRefs.current[at] = node;
    };
  };

  return (
    <div
      ref={rootRef}
      className="mt-root"
      onKeyDown={onRootKeyDown}
      onBlur={onBlur}
      onMouseDown={(event) => {
        if (event.target instanceof Element && event.target.closest('button') !== null) {
          event.preventDefault();
        }
      }}
    >
      <style>{CSS}</style>
      <button
        ref={triggerRef}
        type="button"
        className="mt-trigger"
        aria-label={triggerAria}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        title={triggerLabel}
        aria-busy={busy}
        data-selection-focus={selectionFocus ? '' : undefined}
        onBlur={() => setSelectionFocus(false)}
        disabled={locked}
        onClick={() => {
          if (open) close(true);
          else show();
        }}
      >
        <IconDataOutlineRegular className="mt-triggerIcon" size={16} />
        <span className="mt-triggerLabel">
          {currentChoice === undefined
            ? modelLabel
            : renderModelLabel(currentChoice.group.provider, currentChoice.model, 'trigger', true)}
        </span>
        {effortLabel !== undefined && <span className="mt-triggerEffort">{effortLabel}</span>}
        {busy ? (
          <StateDot state="ongoing" />
        ) : (
          <IconChevronDownOutlineRegular
            className={open ? 'mt-chevron mt-chevronOpen' : 'mt-chevron'}
          />
        )}
      </button>

      {open &&
        createPortal(
          <MenuSurface
            ref={menuRef}
            id={`${id}-menu`}
            className={useTabs && pane === 'model' ? 'mt-menu mt-menuWithTabs' : 'mt-menu'}
            style={menuPos ?? MEASURE_STYLE}
            role={pane === 'model' ? 'group' : 'menu'}
            aria-label={t('menu.aria')}
            aria-busy={state.status === 'loading' || busy}
          >
            {pane === 'root' && (
              <>
                <button
                  ref={itemRef()}
                  type="button"
                  role="menuitem"
                  className="mt-cell"
                  onClick={() => drill('model')}
                >
                  <span className="mt-cellLabel">{t('menu.model')}</span>
                  <span className="mt-cellValue">
                    {currentChoice === undefined
                      ? modelLabel
                      : renderModelLabel(currentChoice.group.provider, currentChoice.model, 'menu', true)}
                  </span>
                  <IconChevronRightOutlineRegular className="mt-cellChevron" />
                </button>
                {reasoning !== undefined && (
                  <button
                    ref={itemRef()}
                    type="button"
                    role="menuitem"
                    className="mt-cell"
                    onClick={() => drill('effort')}
                  >
                    <span className="mt-cellLabel">{t('menu.effort')}</span>
                    <span className="mt-cellValue">{effortLabel}</span>
                    <IconChevronRightOutlineRegular className="mt-cellChevron" />
                  </button>
                )}
              </>
            )}

            {pane === 'model' && (
              <>
                {showSearch && (
                  <div className="mt-searchRow">
                    <Input
                      ref={searchRef}
                      className={query !== '' ? 'mt-search mt-searchWithQuery' : 'mt-search'}
                      type="text"
                      role="searchbox"
                      aria-label={t('search.placeholder')}
                      aria-controls={`${id}-models`}
                      aria-activedescendant={
                        activeModelIndex < 0 ? undefined : `${id}-model-${activeModelIndex}`
                      }
                      placeholder={t('search.placeholder')}
                      value={query}
                      readOnly={busy}
                      onChange={(event) => changeQuery(event.target.value)}
                    />
                    {query !== '' && (
                      <button
                        type="button"
                        className="mt-searchClear"
                        aria-label={t('search.clear')}
                        disabled={busy}
                        onClick={() => {
                          changeQuery('');
                          searchRef.current?.focus();
                        }}
                      >
                        <IconCloseFillRegular />
                      </button>
                    )}
                  </div>
                )}
                {state.status === 'loading' && (
                  <div className="mt-status">{t('status.loading')}</div>
                )}
                {state.error !== null && lastActionRef.current === 'load' && (
                  <div className="mt-error">
                    <span>{t('error.action', { message: state.error })}</span>
                    <button type="button" className="mt-retry" onClick={reload}>
                      {t('retry')}
                    </button>
                  </div>
                )}
                {state.failures.map((failure) => (
                  <div key={failure.id} className="mt-warning">
                    <span>
                      {t('warning.groupLoad', {
                        name:
                          failure.id === 'deepseek-account'
                            ? t('provider.account')
                            : failure.name,
                        message: failure.message,
                      })}
                    </span>
                    <button type="button" className="mt-retry" onClick={reload}>
                      {t('retry')}
                    </button>
                  </div>
                ))}
                <div
                  ref={groupsRef}
                  id={`${id}-models`}
                  className="mt-groups scrollable"
                  role="menu"
                  aria-label={t('menu.model')}
                  hidden={filteredGroups.length === 0}
                >
                  {filteredGroups.map((group) => (
                    <MenuGroup key={group.id} label={group.provider.name}>
                      {group.models.map((model) => {
                        const index = modelIndex++;
                        const selected =
                          state.current?.provider === group.id &&
                          state.current.model === model.id;
                        return (
                          <button
                            key={model.id}
                            ref={itemRef()}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            id={`${id}-model-${index}`}
                            tabIndex={showSearch ? -1 : 0}
                            onFocus={() => setHighlightedIndex(index)}
                            data-highlighted={index === activeModelIndex ? '' : undefined}
                            className={`mt-option mt-modelOption${
                              selected ? ' mt-selected' : ''
                            }${index === activeModelIndex ? ' mt-optionActive' : ''}`}
                            onMouseMove={
                              busy || index === activeModelIndex
                                ? undefined
                                : () => {
                                    if (showSearch) setHighlightedIndex(index);
                                    else itemRefs.current[index]?.focus();
                                  }
                            }
                            title={model.name}
                            disabled={busy}
                            onClick={() =>
                              choose({ provider: group.id, model: model.id })
                            }
                          >
                            <span className="mt-optionCopy">
                              <span className="mt-modelName">
                                {renderModelLabel(group.provider, model, 'option', selected)}
                              </span>
                            </span>
                            <span className="mt-check">
                              {pending?.provider === group.id &&
                              pending.model === model.id ? (
                                <StateDot state="ongoing" />
                              ) : selected ? (
                                <IconCheckOutlineRegular />
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </MenuGroup>
                  ))}
                </div>
                {state.status === 'ready' && filteredGroups.length === 0 && (
                  <div className="mt-empty" role="status">
                    {t(choices.length === 0 ? 'empty.models' : 'search.empty')}
                  </div>
                )}
                {/* 两级 Tab 栏固定在菜单底部，且顺序为 族(上) → 提供商(最底)：
                    菜单底部锚定（底边钉在 trigger 上方），提供商 Tab 恒在最底边，
                    族 Tab 出现/消失只影响它上方，提供商 Tab 位置永远静止，
                    快速切换 provider/族时指针不会滑出菜单误触对话区导致菜单收起 */}
                {useTabs && providerTab !== null && familyTabItems.length > 2 && (
                  <TabStrip
                    items={familyTabItems}
                    value={activeFamily}
                    onChange={setFamilyTab}
                    ariaLabel={t('tabs.familiesAria')}
                    secondary
                  />
                )}
                {useTabs && (
                  <TabStrip
                    items={providerTabItems}
                    value={providerTab}
                    onChange={setProviderTab}
                    ariaLabel={t('tabs.providersAria')}
                  />
                )}
              </>
            )}

            {pane === 'effort' && (
              <>
                {state.error !== null && lastActionRef.current === 'load' && (
                  <div className="mt-error">
                    <span>{t('error.action', { message: state.error })}</span>
                    <button type="button" className="mt-retry" onClick={reload}>
                      {t('action.reload')}
                    </button>
                  </div>
                )}
                {effortChoices.length === 0 ? (
                  <div className="mt-empty">{t('empty.efforts')}</div>
                ) : (
                  effortChoices.map((level) => (
                    <button
                      key={level.key}
                      ref={itemRef()}
                      type="button"
                      role="menuitemradio"
                      aria-checked={effectiveEffort === level.effort}
                      className={`mt-option${effectiveEffort === level.effort ? ' mt-selected' : ''}`}
                      disabled={busy}
                      onClick={() => chooseEffort(level.effort)}
                    >
                      <span className="mt-optionCopy">
                        <span className="mt-modelName">{level.label}</span>
                      </span>
                      <span className="mt-check">
                        {pending !== null &&
                        pending.provider === state.current?.provider &&
                        pending.model === state.current.model &&
                        pending.reasoningEffort === level.effort ? (
                          <StateDot state="ongoing" />
                        ) : effectiveEffort === level.effort ? (
                          <IconCheckOutlineRegular />
                        ) : null}
                      </span>
                    </button>
                  ))
                )}
              </>
            )}
          </MenuSurface>,
          document.body,
        )}

      {toast !== null && (
        <Toast
          key={toast.seq}
          text={toast.text}
          icon={<IconWarningOutlineRegular />}
          anchor={rootRef.current?.closest('[data-composer-card]') ?? null}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
