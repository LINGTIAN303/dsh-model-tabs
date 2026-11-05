window.__ModuleLoader__.load({
  id: "dsh-model-tabs",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // src/client/index.js
    var index_exports = {};
    __export(index_exports, {
      apply: () => apply,
      inject: () => inject
    });
    module.exports = __toCommonJS(index_exports);

    // src/client/locale.js
    var NS = "model-tabs";
    var zh = {
      // 提供方与 Tab
      "provider.account": "DeepSeek 账号",
      "tabs.all": "全部",
      "tabs.providersAria": "按提供商筛选模型",
      "tabs.familiesAria": "按模型系列筛选",
      // 触发器
      "trigger.fallback": "请选择模型",
      "trigger.loading": "正在加载模型…",
      "trigger.selectAria": "请选择模型",
      "trigger.aria": "当前模型：{model}",
      "trigger.ariaEffort": "当前模型：{model}，推理等级：{effort}",
      // 菜单
      "menu.aria": "模型选择",
      "menu.model": "模型",
      "menu.effort": "推理等级",
      // 搜索
      "search.placeholder": "搜索模型",
      "search.clear": "清除搜索",
      "search.empty": "没有匹配的模型",
      // 状态
      "status.loading": "正在加载模型…",
      "empty.models": "没有可用模型",
      "empty.efforts": "该模型没有推理等级选项",
      // 错误
      "error.action": "操作失败：{message}",
      "error.sessionInUse": "该会话被其他窗口占用，请关闭其它 DSH 窗口后重试",
      "warning.groupLoad": "{name} 目录加载失败：{message}",
      retry: "重试",
      "action.reload": "重新加载",
      // 推理等级
      "effort.providerDefault": "提供商默认",
      // 设置页
      nav: "模型 Tab",
      "settings.intro": "大目录时在模型列表上方显示提供商与模型系列两级 Tab，减少滚动翻找。小目录自动保持官方平铺样式。",
      "settings.thresholds": "生效阈值",
      "settings.totalModels": "模型总数超过",
      "settings.perProvider": "或单个提供商模型数超过",
      "settings.rules": "模型系列规则",
      "settings.rulesHint": "按前缀识别系列，最长前缀优先命中；未命中时回退取模型名的前导字母。",
      "settings.template": "填入模板",
      "settings.save": "保存",
      "settings.reset": "恢复默认",
      "settings.saved": "已保存",
      "settings.invalid": "配置无效：{message}"
    };
    var en = {
      "provider.account": "DeepSeek Account",
      "tabs.all": "All",
      "tabs.providersAria": "Filter models by provider",
      "tabs.familiesAria": "Filter models by family",
      "trigger.fallback": "Select model",
      "trigger.loading": "Loading models…",
      "trigger.selectAria": "Select model",
      "trigger.aria": "Current model: {model}",
      "trigger.ariaEffort": "Current model: {model}, reasoning effort: {effort}",
      "menu.aria": "Model selection",
      "menu.model": "Model",
      "menu.effort": "Reasoning effort",
      "search.placeholder": "Search models",
      "search.clear": "Clear search",
      "search.empty": "No matching models",
      "status.loading": "Loading models…",
      "empty.models": "No models available",
      "empty.efforts": "This model has no reasoning effort options",
      "error.action": "Action failed: {message}",
      "error.sessionInUse": "This session is owned by another window. Quit other DSH instances and retry.",
      "warning.groupLoad": "Failed to load {name}: {message}",
      retry: "Retry",
      "action.reload": "Reload",
      "effort.providerDefault": "Provider default",
      nav: "Model Tabs",
      "settings.intro": "Shows provider and model-family tabs above the model list for large catalogs, cutting scroll and visual noise. Small catalogs keep the official flat list.",
      "settings.thresholds": "Activation thresholds",
      "settings.totalModels": "Total models above",
      "settings.perProvider": "Or models in one provider above",
      "settings.rules": "Model family rules",
      "settings.rulesHint": "Families are matched by prefix, longest prefix wins; a miss falls back to the model name leading letters.",
      "settings.template": "Fill template",
      "settings.save": "Save",
      "settings.reset": "Reset to default",
      "settings.saved": "Saved",
      "settings.invalid": "Invalid config: {message}"
    };

    // src/client/ModelSeat.js
    var import_react2 = __toESM(require("react"), 1);

    // src/client/ModelTabs.js
    var import_react = __toESM(require("react"), 1);
    var import_react_dom = require("react-dom");
    var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

    // src/client/family.js
    var DEFAULT_RULES = [
      { key: "deepseek", label: "DeepSeek", prefixes: ["deepseek"] },
      { key: "glm", label: "GLM", prefixes: ["glm"] },
      { key: "kimi", label: "Kimi", prefixes: ["kimi", "moonshot"] },
      { key: "minimax", label: "MiniMax", prefixes: ["minimax"] },
      { key: "qwen", label: "Qwen", prefixes: ["qwen"] },
      { key: "doubao", label: "豆包", prefixes: ["doubao", "seed"] },
      { key: "hy", label: "混元", prefixes: ["hy", "hunyuan"] },
      { key: "ling", label: "Ling", prefixes: ["ling"] },
      { key: "mimo", label: "MiMo", prefixes: ["mimo"] },
      { key: "step", label: "Step", prefixes: ["step"] },
      { key: "gpt", label: "GPT", prefixes: ["gpt"] },
      { key: "claude", label: "Claude", prefixes: ["claude"] },
      { key: "gemini", label: "Gemini", prefixes: ["gemini"] },
      { key: "llama", label: "Llama", prefixes: ["llama"] },
      { key: "mistral", label: "Mistral", prefixes: ["mistral"] },
      { key: "space", label: "Space", prefixes: ["space"] }
    ];
    function normalizeModelName(name) {
      if (typeof name !== "string") return "";
      const slash = name.lastIndexOf("/");
      const base = slash >= 0 ? name.slice(slash + 1) : name;
      const colon = base.indexOf(":");
      const body = colon >= 0 ? base.slice(0, colon) : base;
      return body.trim().toLowerCase();
    }
    function capitalize(key) {
      return key ? key.charAt(0).toUpperCase() + key.slice(1) : key;
    }
    function classifyFamily(name, rules = DEFAULT_RULES) {
      const normalized = normalizeModelName(name);
      const list = Array.isArray(rules) ? rules : [];
      let bestRule = null;
      let bestLength = 0;
      for (const rule of list) {
        if (!rule || typeof rule.key !== "string" || !rule.key) continue;
        if (!Array.isArray(rule.prefixes)) continue;
        for (const prefix of rule.prefixes) {
          if (typeof prefix !== "string" || !prefix) continue;
          if (normalized.startsWith(prefix) && prefix.length > bestLength) {
            bestRule = rule;
            bestLength = prefix.length;
          }
        }
      }
      if (bestRule) return { key: bestRule.key, label: bestRule.label };
      const leading = normalized.match(/^[a-z]+/);
      if (leading) return { key: leading[0], label: capitalize(leading[0]) };
      return { key: "other", label: "其他" };
    }
    function groupByFamily(models, rules = DEFAULT_RULES) {
      const buckets = /* @__PURE__ */ new Map();
      for (const model of Array.isArray(models) ? models : []) {
        const rawName = typeof model === "string" ? model : (model && (model.name ?? model.id)) ?? "";
        const family = classifyFamily(rawName, rules);
        let bucket = buckets.get(family.key);
        if (!bucket) {
          bucket = { key: family.key, label: family.label, models: [] };
          buckets.set(family.key, bucket);
        }
        bucket.models.push(model);
      }
      return [...buckets.values()].sort((a, b) => {
        if (b.models.length !== a.models.length) return b.models.length - a.models.length;
        return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      });
    }

    // src/client/config.js
    var CONFIG_KEY = "dsh-model-tabs.config";
    var CONFIG_VERSION = 1;
    var DEFAULT_CONFIG = {
      version: CONFIG_VERSION,
      thresholds: { totalModels: 20, perProvider: 30 },
      rules: DEFAULT_RULES.map(cloneRule),
      // 内置默认族规则的克隆快照
      overrides: []
      // 用户自定义/覆盖规则
    };
    var THRESHOLD_MIN = 1;
    var THRESHOLD_MAX = 1e3;
    var localListeners = /* @__PURE__ */ new Set();
    function isPlainObject(value) {
      return !!value && typeof value === "object" && !Array.isArray(value);
    }
    function resolveStorage(storage) {
      if (storage && typeof storage.getItem === "function") return storage;
      try {
        if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
      } catch {
      }
      return null;
    }
    function cloneRule(rule) {
      return { key: rule.key, label: rule.label, prefixes: rule.prefixes.slice() };
    }
    function cloneDefaultConfig() {
      return {
        version: CONFIG_VERSION,
        thresholds: { ...DEFAULT_CONFIG.thresholds },
        rules: DEFAULT_RULES.map(cloneRule),
        overrides: []
      };
    }
    function validateRule(raw) {
      if (!isPlainObject(raw)) return null;
      if (typeof raw.key !== "string" || !raw.key.trim()) return null;
      if (typeof raw.label !== "string") return null;
      if (!Array.isArray(raw.prefixes) || raw.prefixes.length === 0) return null;
      const prefixes = [];
      for (const prefix of raw.prefixes) {
        if (typeof prefix !== "string") return null;
        const trimmed = prefix.trim();
        if (!trimmed) return null;
        if (trimmed !== trimmed.toLowerCase()) return null;
        if (/\s/.test(trimmed)) return null;
        prefixes.push(trimmed);
      }
      if (prefixes.length === 0) return null;
      const key = raw.key.trim();
      const label = raw.label.trim() || key;
      return { key, label, prefixes };
    }
    function validateRuleList(raw, fallback = []) {
      if (!Array.isArray(raw)) return fallback.map(cloneRule);
      const result = [];
      for (const item of raw) {
        const rule = validateRule(item);
        if (rule) result.push(rule);
      }
      return result;
    }
    function validateThreshold(value, fallback) {
      if (typeof value !== "number" || !Number.isInteger(value)) return fallback;
      if (value < THRESHOLD_MIN || value > THRESHOLD_MAX) return fallback;
      return value;
    }
    function validateConfig(raw) {
      if (!isPlainObject(raw)) return { ok: false, error: "配置必须是对象" };
      if (raw.version !== CONFIG_VERSION) {
        return { ok: false, error: `version 必须为 ${CONFIG_VERSION}` };
      }
      const sourceThresholds = isPlainObject(raw.thresholds) ? raw.thresholds : {};
      const value = {
        version: CONFIG_VERSION,
        thresholds: {
          totalModels: validateThreshold(sourceThresholds.totalModels, DEFAULT_CONFIG.thresholds.totalModels),
          perProvider: validateThreshold(sourceThresholds.perProvider, DEFAULT_CONFIG.thresholds.perProvider)
        },
        // 非数组回退内置规则；数组内非法项逐条丢弃
        rules: validateRuleList(raw.rules, DEFAULT_RULES),
        overrides: validateRuleList(raw.overrides, [])
      };
      return { ok: true, value };
    }
    function loadConfig(storage) {
      try {
        const store = resolveStorage(storage);
        if (!store) return cloneDefaultConfig();
        const raw = store.getItem(CONFIG_KEY);
        if (raw == null || raw === "") return cloneDefaultConfig();
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const result = validateConfig(parsed);
        return result.ok ? result.value : cloneDefaultConfig();
      } catch {
        return cloneDefaultConfig();
      }
    }
    function notifyLocal(config) {
      for (const listener of [...localListeners]) {
        try {
          listener(config);
        } catch {
        }
      }
    }
    function saveConfig(config, storage) {
      const result = validateConfig(config);
      if (!result.ok) return { ok: false, error: result.error || "配置校验失败" };
      const store = resolveStorage(storage);
      if (!store || typeof store.setItem !== "function") return { ok: false, error: "storage 不可用" };
      try {
        store.setItem(CONFIG_KEY, JSON.stringify(result.value));
      } catch (error) {
        return { ok: false, error: error && error.message || "写入失败" };
      }
      notifyLocal(result.value);
      return { ok: true };
    }
    function effectiveRules(config) {
      const source = isPlainObject(config) ? config : DEFAULT_CONFIG;
      const merged = validateRuleList(source.rules, DEFAULT_RULES);
      const indexByKey = /* @__PURE__ */ new Map();
      merged.forEach((rule, index) => indexByKey.set(rule.key, index));
      for (const override of validateRuleList(source.overrides, [])) {
        const index = indexByKey.get(override.key);
        if (index === void 0) {
          indexByKey.set(override.key, merged.length);
          merged.push(override);
        } else {
          merged[index] = override;
        }
      }
      return merged;
    }
    function subscribeConfig(listener, storage) {
      if (typeof listener !== "function") return () => {
      };
      localListeners.add(listener);
      const store = resolveStorage(storage);
      const target = typeof globalThis !== "undefined" && typeof globalThis.addEventListener === "function" ? globalThis : null;
      const onStorage = (event) => {
        if (event && typeof event.key === "string" && event.key !== CONFIG_KEY) return;
        try {
          listener(loadConfig(store || void 0));
        } catch {
        }
      };
      const storeHasEvents = store && typeof store.addEventListener === "function";
      if (storeHasEvents) store.addEventListener("storage", onStorage);
      if (target) target.addEventListener("storage", onStorage);
      return () => {
        localListeners.delete(listener);
        if (storeHasEvents) store.removeEventListener("storage", onStorage);
        if (target) target.removeEventListener("storage", onStorage);
      };
    }

    // src/client/ModelTabs.js
    var import_jsx_runtime = require("react/jsx-runtime");
    var CSS = [
      ".mt-root{min-width:0;position:relative}",
      // trigger：与官方 _9r0rkG_trigger 逐项对齐
      ".mt-trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:400;line-height:20px;display:flex}",
      ".mt-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
      ".mt-trigger:focus-visible:not([data-selection-focus]){box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
      ".mt-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
      ".mt-triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
      ".mt-triggerEffort{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);flex-shrink:1000;overflow:hidden}",
      ".mt-triggerIcon{display:var(--dsh-composer-model-icon-display,none);flex:none}",
      ".mt-triggerLabel,.mt-triggerEffort{display:var(--dsh-composer-model-text-display,block)}",
      ".mt-chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}",
      ".mt-chevronOpen{transform:rotate(180deg)}",
      // 菜单外壳：与官方 _9r0rkG_menu 对齐（小目录走官方 420x360）
      // Tab 模式下宽度固定（见 .mt-menuWithTabs）：不同 provider/族数量下菜单宽度不再抖动，
      ".mt-menu{z-index:1100;--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsh-scrollbar-hover-l2);border:0;flex-direction:column;padding:4px;display:flex;position:fixed;overflow:hidden}",
      // 大目录（Tab 模式）尺寸 500x470：底部两条 Tab + 搜索框占 ~90px 后列表仍可容纳 ~10 行；
      // 小目录不含 Tab 条，不会命中这条规则，保持官方观感。
      ".mt-menuWithTabs{width:min(500px,100vw - 32px);min-width:min(500px,100vw - 32px);max-width:min(500px,100vw - 32px);max-height:min(470px,100vh - 96px)}",
      ".mt-status,.mt-empty{color:var(--dsw-alias-label-tertiary);padding:8px;font-size:12px;line-height:18px}",
      ".mt-error,.mt-warning{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:3px;padding:6px 7px;font-size:11px;line-height:16px;display:flex}",
      ".mt-warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}",
      ".mt-retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}",
      ".mt-searchRow{flex-shrink:0;margin:2px 0 3px;position:relative}",
      ".mt-searchRow .mt-search{border-radius:var(--dsw-radius-md);background:0 0;border:0 solid #0000;height:auto;padding:5px 7px;display:flex}",
      ".mt-searchRow .mt-searchWithQuery{padding-right:34px}",
      ".mt-searchClear{corner-shape:round;width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;padding:0;display:inline-flex;position:absolute;top:50%;right:4px;transform:translateY(-50%)}",
      ".mt-searchClear:hover,.mt-searchClear:focus-visible{background:var(--dsw-alias-interactive-bg-hover);outline:none}",
      ".mt-searchRow .mt-search:focus-within{border-color:#0000}",
      ".mt-searchRow .mt-search input{padding:0;font-size:12px;line-height:normal}",
      ".mt-searchRow .mt-search input::placeholder{color:var(--dsw-alias-label-caption)}",
      ".mt-groups{min-height:0;overflow-y:auto}",
      ".mt-option{box-sizing:border-box;border-radius:var(--dsw-radius-md);width:auto;min-width:100%;min-height:34px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:6px;padding:5px 7px;display:flex}",
      ".mt-option:not(.mt-modelOption):hover:not(:disabled),.mt-option:focus-visible,.mt-optionActive:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
      ".mt-option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
      ".mt-optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}",
      ".mt-modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:400;line-height:18px;overflow:hidden}",
      ".mt-check{color:var(--dsw-alias-label-primary);flex:0 0 14px;place-items:center;display:grid}",
      ".mt-check svg{width:14px;height:14px}",
      ".mt-cell{box-sizing:border-box;border-radius:var(--dsw-radius-md);width:auto;min-width:100%;height:34px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;outline:none;align-items:center;gap:6px;padding:0 8px;font-size:13px;line-height:20px;display:flex}",
      ".mt-cell:hover,.mt-cell:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}",
      ".mt-cellLabel{white-space:nowrap;flex:none}",
      ".mt-cellValue{text-overflow:ellipsis;white-space:nowrap;text-align:right;min-width:0;color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}",
      ".mt-cellChevron{width:12px;height:12px;color:var(--dsw-alias-menu-icon);flex:none}",
      // 两级 Tab 条：横向可滚动，不换行；族条在上（无边框），提供商条钉在最底边（上边框与列表分隔）
      ".mt-tabs{display:flex;gap:2px;padding:3px 4px 2px;flex-shrink:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;border-top:.5px solid var(--dsw-alias-border-l2)}",
      ".mt-tabs::-webkit-scrollbar{display:none}",
      // 族条：出现在提供商条上方，自身用上边框与列表分隔，不带下边框
      ".mt-tabsSecondary{border-top:.5px solid var(--dsw-alias-border-l2);border-bottom:0}",
      ".mt-tab{appearance:none;border:none;background:0 0;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:12px;line-height:17px;height:24px;padding:0 8px;border-radius:var(--dsw-radius-sm);cursor:pointer;white-space:nowrap;flex:none;align-items:center;gap:5px;display:inline-flex;position:relative}",
      ".mt-tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".mt-tab[aria-selected=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}",
      ".mt-tab:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}",
      ".mt-tabCount{color:var(--dsw-alias-label-caption);font-size:11px;font-weight:400;font-variant-numeric:tabular-nums}",
      ".mt-tab[aria-selected=true] .mt-tabCount{color:var(--dsw-alias-label-secondary)}",
      ".mt-tabScrollHint{display:flex;align-items:center;justify-content:center;flex:none;width:16px;color:var(--dsw-alias-label-caption);pointer-events:none}"
    ].join("\n");
    var MEASURE_STYLE = { visibility: "hidden", left: 0, top: 0 };
    var MARGIN = 12;
    var EMPTY_GROUPS = [];
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
    function orderProviders(groups) {
      return groups.slice().sort(
        (left, right) => (left.id === "deepseek-account" ? 0 : left.id === "deepseek-official" ? 1 : 2) - (right.id === "deepseek-account" ? 0 : right.id === "deepseek-official" ? 1 : 2)
      );
    }
    function TabStrip({ items, value, onChange, ariaLabel, secondary = false }) {
      const listRef = import_react.default.useRef(null);
      import_react.default.useEffect(() => {
        const list = listRef.current;
        if (list === null) return;
        const selected = list.querySelector('[aria-selected="true"]');
        if (selected === null) return;
        selected.scrollIntoView({ block: "nearest", inline: "nearest" });
      }, [value, items]);
      const onKeyDown = (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        event.stopPropagation();
        const current = items.findIndex((item) => item.key === value);
        const delta = event.key === "ArrowRight" ? 1 : -1;
        const next = items[(current + delta + items.length) % items.length];
        if (next === void 0) return;
        onChange(next.key);
        queueMicrotask(() => {
          const list = listRef.current;
          if (list === null) return;
          const buttons = list.querySelectorAll('[role="tab"]');
          buttons[(current + delta + items.length) % items.length]?.focus();
        });
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          ref: listRef,
          role: "tablist",
          "aria-label": ariaLabel,
          className: secondary ? "mt-tabs mt-tabsSecondary" : "mt-tabs",
          onKeyDown,
          children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              role: "tab",
              className: "mt-tab",
              "aria-selected": item.key === value,
              tabIndex: item.key === value ? 0 : -1,
              onClick: () => onChange(item.key),
              children: [
                item.label,
                item.count !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-tabCount", children: item.count })
              ]
            },
            item.key ?? "__all__"
          ))
        }
      );
    }
    function ModelTabs({ locked, available, directory, load, select, t }) {
      const state = import_react.default.useSyncExternalStore(
        (fn) => directory.subscribe(fn),
        () => directory.getSnapshot()
      );
      const [open, setOpen] = import_react.default.useState(false);
      const [pane, setPane] = import_react.default.useState("root");
      const [query, setQuery] = import_react.default.useState("");
      const [highlightedIndex, setHighlightedIndex] = import_react.default.useState(null);
      const [selectionFocus, setSelectionFocus] = import_react.default.useState(false);
      const [toast, setToast] = import_react.default.useState(null);
      const [menuPos, setMenuPos] = import_react.default.useState(null);
      const [providerTab, setProviderTab] = import_react.default.useState(null);
      const [familyTab, setFamilyTab] = import_react.default.useState(null);
      const lastActionRef = import_react.default.useRef("load");
      const toastSeq = import_react.default.useRef(0);
      const rootRef = import_react.default.useRef(null);
      const triggerRef = import_react.default.useRef(null);
      const searchRef = import_react.default.useRef(null);
      const menuRef = import_react.default.useRef(null);
      const groupsRef = import_react.default.useRef(null);
      const itemRefs = import_react.default.useRef([]);
      const paneFocus = import_react.default.useRef(null);
      const id = import_react.default.useId();
      const [config, setConfig] = import_react.default.useState(() => loadConfig());
      import_react.default.useEffect(() => subscribeConfig(() => setConfig(loadConfig())), []);
      const rules = import_react.default.useMemo(() => effectiveRules(config), [config]);
      const thresholds = config.thresholds;
      const accountProviderName = t("provider.account");
      const groups = import_react.default.useMemo(
        () => orderProviders(state.groups).map((group) => ({
          ...group,
          provider: {
            id: group.id,
            name: group.id === "deepseek-account" ? accountProviderName : group.name
          }
        })),
        [state.groups, accountProviderName]
      );
      const choices = import_react.default.useMemo(
        () => groups.flatMap(
          (group) => group.models.map((model) => ({
            group,
            model,
            selection: {
              provider: group.id,
              model: model.id,
              ...model.reasoning?.defaultEffort === void 0 ? {} : { reasoningEffort: model.reasoning.defaultEffort }
            }
          }))
        ),
        [groups]
      );
      const useTabs = import_react.default.useMemo(
        () => needsTabs(groups, thresholds),
        [groups, thresholds]
      );
      const showSearch = choices.length > 4;
      const providerTabItems = import_react.default.useMemo(() => {
        if (!useTabs) return EMPTY_GROUPS;
        return [
          { key: null, label: t("tabs.all"), count: choices.length },
          ...groups.map((group) => ({
            key: group.id,
            label: group.provider.name,
            count: group.models.length
          }))
        ];
      }, [useTabs, groups, choices.length, t]);
      const scopedGroups = import_react.default.useMemo(
        () => providerTab === null ? groups : groups.filter((group) => group.id === providerTab),
        [groups, providerTab]
      );
      const familyTabItems = import_react.default.useMemo(() => {
        if (!useTabs || providerTab === null) return EMPTY_GROUPS;
        const families = groupByFamily(
          scopedGroups.flatMap((group) => group.models),
          rules
        );
        return [
          { key: null, label: t("tabs.all"), count: families.reduce((sum, f) => sum + f.models.length, 0) },
          ...families.map((family) => ({
            key: family.key,
            label: family.label,
            count: family.models.length
          }))
        ];
      }, [useTabs, providerTab, scopedGroups, rules, t]);
      const activeFamily = providerTab === null || familyTab === null ? null : familyTabItems.some((item) => item.key === familyTab) ? familyTab : null;
      const filteredGroups = import_react.default.useMemo(() => {
        const trimmed = showSearch ? query.trim() : "";
        return scopedGroups.map((group) => {
          let models = group.models;
          if (activeFamily !== null) {
            models = models.filter((model) => classifyFamily(model.name ?? model.id, rules).key === activeFamily);
          }
          return { ...group, models: (0, import_dsh_client_ui_primitives.rankByName)(models, trimmed) };
        }).filter((group) => group.models.length > 0);
      }, [scopedGroups, activeFamily, rules, query, showSearch]);
      const visibleModels = import_react.default.useMemo(
        () => filteredGroups.flatMap(
          (group) => group.models.map((model) => ({ provider: group.id, model: model.id }))
        ),
        [filteredGroups]
      );
      const currentVisibleIndex = visibleModels.findIndex(
        (model) => model.provider === state.current?.provider && model.model === state.current.model
      );
      const activeModelIndex = Math.min(
        highlightedIndex ?? Math.max(0, currentVisibleIndex),
        visibleModels.length - 1
      );
      const currentChoice = choices[state.current === null ? -1 : choices.findIndex(
        (c) => c.selection.provider === state.current?.provider && c.selection.model === state.current.model
      )];
      const reasoning = currentChoice?.model.reasoning;
      const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
      const effortLabel = currentChoice === void 0 ? void 0 : reasoning === void 0 ? state.retainedEffort : effectiveEffort === void 0 ? t("effort.providerDefault") : reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
      const effortChoices = import_react.default.useMemo(
        () => reasoning === void 0 ? [] : [
          ...reasoning.defaultEffort === void 0 ? [{ key: "provider-default", effort: void 0, label: t("effort.providerDefault") }] : [],
          ...reasoning.efforts.map((effort) => ({
            key: `effort:${effort.id}`,
            effort: effort.id,
            label: effort.name
          }))
        ],
        [reasoning, t]
      );
      const { pending } = state;
      const busy = pending !== null;
      const reload = () => {
        lastActionRef.current = "load";
        load();
      };
      import_react.default.useEffect(() => {
        if (!open) return;
        const closeOutside = (event) => {
          if (rootRef.current?.contains(event.target) === true) return;
          if (menuRef.current?.contains(event.target) === true) return;
          setOpen(false);
        };
        document.addEventListener("mousedown", closeOutside);
        return () => document.removeEventListener("mousedown", closeOutside);
      }, [open]);
      import_react.default.useLayoutEffect(() => {
        if (!useTabs) {
          setProviderTab(null);
          setFamilyTab(null);
        }
      }, [useTabs]);
      import_react.default.useLayoutEffect(() => {
        setFamilyTab(null);
      }, [providerTab]);
      import_react.default.useEffect(() => {
        const intent = paneFocus.current;
        paneFocus.current = null;
        if (!open || intent === null) return;
        if (intent === "drill") {
          if (pane === "model" && showSearch) {
            searchRef.current?.focus();
            return;
          }
          (menuRef.current?.querySelector('[role="menuitemradio"][aria-checked="true"]:not([disabled])') ?? itemRefs.current.find((item) => item !== null && !item.disabled) ?? triggerRef.current)?.focus();
          return;
        }
        const cell = itemRefs.current[intent === "effort" ? 1 : 0];
        (cell !== null && cell !== void 0 && !cell.disabled ? cell : triggerRef.current)?.focus();
      }, [open, pane, showSearch]);
      import_react.default.useEffect(() => {
        const viewport = groupsRef.current;
        if (viewport === null) return;
        return (0, import_dsh_client_ui_primitives.observeStickyMenuGroups)(viewport);
      }, [available, open, pane, filteredGroups]);
      import_react.default.useLayoutEffect(() => {
        if (open && pane === "model" && activeModelIndex >= 0) {
          itemRefs.current[activeModelIndex]?.scrollIntoView({ block: "nearest" });
        }
      }, [open, pane, activeModelIndex, visibleModels]);
      import_react.default.useLayoutEffect(() => {
        if (!available || !open) {
          setMenuPos(null);
          return;
        }
        const place = () => {
          const rect = triggerRef.current?.getBoundingClientRect();
          if (rect === void 0) return;
          const lw = menuRef.current?.offsetWidth ?? 0;
          const lh = menuRef.current?.offsetHeight ?? 0;
          let x = rect.right - lw;
          let y = rect.top - 8 - lh;
          if (lw > 0) x = Math.min(Math.max(x, MARGIN), window.innerWidth - lw - MARGIN);
          if (lh > 0) y = Math.min(Math.max(y, MARGIN), window.innerHeight - lh - MARGIN);
          setMenuPos({ left: x, top: y });
        };
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        const menu = menuRef.current;
        const observer = typeof ResizeObserver !== "undefined" && menu !== null ? new ResizeObserver(place) : null;
        if (menu !== null) observer?.observe(menu);
        return () => {
          observer?.disconnect();
          window.removeEventListener("scroll", place, true);
          window.removeEventListener("resize", place);
        };
      }, [available, open, pane, state, query, providerTab, activeFamily]);
      if (!available) return null;
      const show = () => {
        setSelectionFocus(false);
        triggerRef.current?.focus();
        setQuery("");
        setHighlightedIndex(null);
        if (currentChoice === void 0) paneFocus.current = "drill";
        setPane(currentChoice === void 0 ? "model" : "root");
        setOpen(true);
        reload();
      };
      const changeQuery = (next) => {
        setQuery(next);
        setHighlightedIndex(0);
      };
      const close = (restoreFocus = false) => {
        setOpen(false);
        setPane("root");
        if (restoreFocus) {
          queueMicrotask(() => triggerRef.current?.focus());
        }
      };
      const closeAfterSelection = () => {
        setSelectionFocus(true);
        close(true);
      };
      const drill = (next) => {
        setQuery("");
        setHighlightedIndex(null);
        paneFocus.current = "drill";
        setPane(next);
      };
      const back = (from) => {
        paneFocus.current = from;
        setPane("root");
      };
      const moveFocus = (offset) => {
        const items = itemRefs.current.filter((item) => item !== null);
        if (items.length === 0) return;
        const active = items.findIndex((item) => item === document.activeElement);
        items[active === -1 ? offset > 0 ? 0 : items.length - 1 : (active + offset + items.length) % items.length]?.focus();
      };
      const onRootKeyDown = (event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape" && open) {
          event.preventDefault();
          if (pane !== "root" && currentChoice !== void 0) back(pane);
          else close(true);
          return;
        }
        if (!open) return;
        if (pane === "model" && showSearch && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          event.preventDefault();
          if (!busy && visibleModels.length > 0) {
            setHighlightedIndex(
              (activeModelIndex + (event.key === "ArrowDown" ? 1 : -1) + visibleModels.length) % visibleModels.length
            );
            searchRef.current?.focus();
          }
          return;
        }
        if (pane === "model" && showSearch && event.target instanceof HTMLInputElement && (event.key === "Enter" || event.key === "Tab" && !event.shiftKey)) {
          if (event.key === "Tab" && visibleModels.length === 0) return;
          event.preventDefault();
          const highlighted = visibleModels[activeModelIndex];
          if (!busy && highlighted !== void 0) choose(highlighted);
          return;
        }
        if (event.key === "Tab") {
          if (event.shiftKey) {
            event.preventDefault();
            if (pane !== "root" && currentChoice !== void 0) back(pane);
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
          if (pane === "model" && showSearch) {
            setHighlightedIndex(null);
            searchRef.current?.focus();
            return;
          }
          (menuRef.current?.querySelector('[role="menuitemradio"][aria-checked="true"]:not([disabled])') ?? rows.find((item) => !item.disabled))?.focus();
          return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          moveFocus(event.key === "ArrowDown" ? 1 : -1);
        }
      };
      const onBlur = (event) => {
        if (event.relatedTarget instanceof Node && (rootRef.current?.contains(event.relatedTarget) === true || menuRef.current?.contains(event.relatedTarget) === true)) {
          return;
        }
        close();
      };
      const settleSelection = (result) => {
        if (result === void 0) return;
        if (result.ok) {
          if (rootRef.current !== null) closeAfterSelection();
          return;
        }
        const { error } = result;
        toastSeq.current += 1;
        setToast({
          seq: toastSeq.current,
          text: error.code === "session/writer-held" ? t("error.sessionInUse") : t("error.action", { message: `${error.code}: ${error.message}` })
        });
      };
      const submit = (selection) => {
        lastActionRef.current = "select";
        setSelectionFocus(true);
        triggerRef.current?.focus();
        select(selection).then(settleSelection);
      };
      const choose = (selection) => {
        if (state.current?.provider === selection.provider && state.current.model === selection.model) {
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
          ...effort === void 0 ? {} : { reasoningEffort: effort }
        });
      };
      const waiting = currentChoice === void 0 && state.status === "loading";
      const modelLabel = waiting ? t("trigger.loading") : currentChoice?.model.name ?? t("trigger.fallback");
      const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
      const triggerAria = waiting ? t("trigger.loading") : currentChoice === void 0 ? t("trigger.selectAria") : effortLabel === void 0 ? t("trigger.aria", { model: modelLabel }) : t("trigger.ariaEffort", { model: modelLabel, effort: effortLabel });
      const renderModelLabel = (provider, model, placement, selected) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-provider-id": provider.id, "data-model-id": model.id, children: model.name });
      itemRefs.current = [];
      let itemIndex = 0;
      let modelIndex = 0;
      const itemRef = () => {
        const at = itemIndex++;
        return (node) => {
          itemRefs.current[at] = node;
        };
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          ref: rootRef,
          className: "mt-root",
          onKeyDown: onRootKeyDown,
          onBlur,
          onMouseDown: (event) => {
            if (event.target instanceof Element && event.target.closest("button") !== null) {
              event.preventDefault();
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: CSS }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                ref: triggerRef,
                type: "button",
                className: "mt-trigger",
                "aria-label": triggerAria,
                "aria-haspopup": "menu",
                "aria-expanded": open,
                "aria-controls": open ? `${id}-menu` : void 0,
                title: triggerLabel,
                "aria-busy": busy,
                "data-selection-focus": selectionFocus ? "" : void 0,
                onBlur: () => setSelectionFocus(false),
                disabled: locked,
                onClick: () => {
                  if (open) close(true);
                  else show();
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { className: "mt-triggerIcon", size: 16 }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-triggerLabel", children: currentChoice === void 0 ? modelLabel : renderModelLabel(currentChoice.group.provider, currentChoice.model, "trigger", true) }),
                  effortLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-triggerEffort", children: effortLabel }),
                  busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    import_dsh_client_ui_primitives.IconChevronDownOutlineRegular,
                    {
                      className: open ? "mt-chevron mt-chevronOpen" : "mt-chevron"
                    }
                  )
                ]
              }
            ),
            open && (0, import_react_dom.createPortal)(
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                import_dsh_client_ui_primitives.MenuSurface,
                {
                  ref: menuRef,
                  id: `${id}-menu`,
                  className: useTabs && pane === "model" ? "mt-menu mt-menuWithTabs" : "mt-menu",
                  style: menuPos ?? MEASURE_STYLE,
                  role: pane === "model" ? "group" : "menu",
                  "aria-label": t("menu.aria"),
                  "aria-busy": state.status === "loading" || busy,
                  children: [
                    pane === "root" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          ref: itemRef(),
                          type: "button",
                          role: "menuitem",
                          className: "mt-cell",
                          onClick: () => drill("model"),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-cellLabel", children: t("menu.model") }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-cellValue", children: currentChoice === void 0 ? modelLabel : renderModelLabel(currentChoice.group.provider, currentChoice.model, "menu", true) }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: "mt-cellChevron" })
                          ]
                        }
                      ),
                      reasoning !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          ref: itemRef(),
                          type: "button",
                          role: "menuitem",
                          className: "mt-cell",
                          onClick: () => drill("effort"),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-cellLabel", children: t("menu.effort") }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-cellValue", children: effortLabel }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: "mt-cellChevron" })
                          ]
                        }
                      )
                    ] }),
                    pane === "model" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                      showSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-searchRow", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          import_dsh_client_ui_primitives.Input,
                          {
                            ref: searchRef,
                            className: query !== "" ? "mt-search mt-searchWithQuery" : "mt-search",
                            type: "text",
                            role: "searchbox",
                            "aria-label": t("search.placeholder"),
                            "aria-controls": `${id}-models`,
                            "aria-activedescendant": activeModelIndex < 0 ? void 0 : `${id}-model-${activeModelIndex}`,
                            placeholder: t("search.placeholder"),
                            value: query,
                            readOnly: busy,
                            onChange: (event) => changeQuery(event.target.value)
                          }
                        ),
                        query !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "button",
                          {
                            type: "button",
                            className: "mt-searchClear",
                            "aria-label": t("search.clear"),
                            disabled: busy,
                            onClick: () => {
                              changeQuery("");
                              searchRef.current?.focus();
                            },
                            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCloseFillRegular, {})
                          }
                        )
                      ] }),
                      state.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-status", children: t("status.loading") }),
                      state.error !== null && lastActionRef.current === "load" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-error", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "mt-retry", onClick: reload, children: t("retry") })
                      ] }),
                      state.failures.map((failure) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-warning", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("warning.groupLoad", {
                          name: failure.id === "deepseek-account" ? t("provider.account") : failure.name,
                          message: failure.message
                        }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "mt-retry", onClick: reload, children: t("retry") })
                      ] }, failure.id)),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        "div",
                        {
                          ref: groupsRef,
                          id: `${id}-models`,
                          className: "mt-groups scrollable",
                          role: "menu",
                          "aria-label": t("menu.model"),
                          hidden: filteredGroups.length === 0,
                          children: filteredGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.MenuGroup, { label: group.provider.name, children: group.models.map((model) => {
                            const index = modelIndex++;
                            const selected = state.current?.provider === group.id && state.current.model === model.id;
                            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                              "button",
                              {
                                ref: itemRef(),
                                type: "button",
                                role: "menuitemradio",
                                "aria-checked": selected,
                                id: `${id}-model-${index}`,
                                tabIndex: showSearch ? -1 : 0,
                                onFocus: () => setHighlightedIndex(index),
                                "data-highlighted": index === activeModelIndex ? "" : void 0,
                                className: `mt-option mt-modelOption${selected ? " mt-selected" : ""}${index === activeModelIndex ? " mt-optionActive" : ""}`,
                                onMouseMove: busy || index === activeModelIndex ? void 0 : () => {
                                  if (showSearch) setHighlightedIndex(index);
                                  else itemRefs.current[index]?.focus();
                                },
                                title: model.name,
                                disabled: busy,
                                onClick: () => choose({ provider: group.id, model: model.id }),
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-optionCopy", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-modelName", children: renderModelLabel(group.provider, model, "option", selected) }) }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-check", children: pending?.provider === group.id && pending.model === model.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null })
                                ]
                              },
                              model.id
                            );
                          }) }, group.id))
                        }
                      ),
                      state.status === "ready" && filteredGroups.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-empty", role: "status", children: t(choices.length === 0 ? "empty.models" : "search.empty") }),
                      useTabs && providerTab !== null && familyTabItems.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        TabStrip,
                        {
                          items: familyTabItems,
                          value: activeFamily,
                          onChange: setFamilyTab,
                          ariaLabel: t("tabs.familiesAria"),
                          secondary: true
                        }
                      ),
                      useTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        TabStrip,
                        {
                          items: providerTabItems,
                          value: providerTab,
                          onChange: setProviderTab,
                          ariaLabel: t("tabs.providersAria")
                        }
                      )
                    ] }),
                    pane === "effort" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                      state.error !== null && lastActionRef.current === "load" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-error", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "mt-retry", onClick: reload, children: t("action.reload") })
                      ] }),
                      effortChoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-empty", children: t("empty.efforts") }) : effortChoices.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          ref: itemRef(),
                          type: "button",
                          role: "menuitemradio",
                          "aria-checked": effectiveEffort === level.effort,
                          className: `mt-option${effectiveEffort === level.effort ? " mt-selected" : ""}`,
                          disabled: busy,
                          onClick: () => chooseEffort(level.effort),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-optionCopy", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-modelName", children: level.label }) }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-check", children: pending !== null && pending.provider === state.current?.provider && pending.model === state.current.model && pending.reasoningEffort === level.effort ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : effectiveEffort === level.effort ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null })
                          ]
                        },
                        level.key
                      ))
                    ] })
                  ]
                }
              ),
              document.body
            ),
            toast !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_dsh_client_ui_primitives.Toast,
              {
                text: toast.text,
                icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
                anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
                onDone: () => setToast(null)
              },
              toast.seq
            )
          ]
        }
      );
    }

    // src/client/seat.js
    var DIAG_KEY = "dsh-model-tabs.lastError";
    var abandon = null;
    function setSeatAbandon(fn) {
      abandon = typeof fn === "function" ? fn : null;
    }
    function abandonSeat() {
      const fn = abandon;
      abandon = null;
      if (fn === null) return;
      try {
        fn();
      } catch {
      }
    }
    function recordRenderError(error, info) {
      const record = {
        time: (/* @__PURE__ */ new Date()).toISOString(),
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error && typeof error.stack === "string" ? error.stack.slice(0, 4e3) : null,
        componentStack: info !== void 0 && typeof info.componentStack === "string" ? info.componentStack.slice(0, 4e3) : null
      };
      try {
        globalThis.localStorage?.setItem(DIAG_KEY, JSON.stringify(record));
      } catch {
      }
      try {
        globalThis.console?.error("[dsh-model-tabs] 模型座位渲染失败，已让位给官方选择器：", error, info);
      } catch {
      }
    }

    // src/client/ModelSeat.js
    var SeatBoundary = class extends import_react2.default.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }
      /** React 要求静态方法，用于把错误转成 state。 */
      static getDerivedStateFromError() {
        return { failed: true };
      }
      /** 记录现场并让位；两个动作都不允许再抛错。 */
      componentDidCatch(error, info) {
        recordRenderError(error, info);
        abandonSeat();
      }
      render() {
        return this.state.failed ? null : this.props.children;
      }
    };
    function ModelSeat(props) {
      return import_react2.default.createElement(SeatBoundary, null, import_react2.default.createElement(ModelTabs, props));
    }

    // src/client/SettingsPanel.js
    var import_react3 = __toESM(require("react"), 1);
    var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
    var import_jsx_runtime2 = require("react/jsx-runtime");
    var CSS2 = [
      // 容器：设置面板里的一页内容
      ".mts-root{display:flex;flex-direction:column;gap:14px;max-width:840px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}",
      ".mts-head{display:flex;flex-direction:column;gap:3px}",
      ".mts-title{margin:0;font-size:15px;line-height:22px;font-weight:600}",
      ".mts-intro{margin:0;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-secondary)}",
      // 顶部提示条：先纯 token 兜底，再 color-mix 叠淡色底
      ".mts-banner{display:flex;align-items:flex-start;gap:8px;padding:8px 11px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);font-size:12.5px;line-height:18px}",
      ".mts-banner-error{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 9%,var(--dsw-alias-bg-layer-1))}",
      ".mts-banner-ok{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 9%,var(--dsw-alias-bg-layer-1))}",
      ".mts-banner-txt{flex:1;min-width:0;word-break:break-word}",
      ".mts-banner-icon{flex:none;margin-top:2px}",
      // 区块
      ".mts-block{display:flex;flex-direction:column;gap:8px;padding:12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}",
      ".mts-block-head{display:flex;flex-direction:column;gap:2px}",
      ".mts-block-title{margin:0;font-size:13px;line-height:20px;font-weight:600}",
      ".mts-hint{margin:0;font-size:11.5px;line-height:17px;color:var(--dsw-alias-label-secondary)}",
      // 阈值行
      ".mts-fields{display:flex;flex-wrap:wrap;gap:14px}",
      ".mts-field{display:flex;align-items:center;gap:8px}",
      ".mts-field-label{font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
      ".mts-number{box-sizing:border-box;width:88px;height:28px;padding:0 8px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12.5px;line-height:18px;font-variant-numeric:tabular-nums;outline:none}",
      ".mts-number:focus-visible{border-color:var(--dsw-alias-brand-primary)}",
      // 规则编辑器
      ".mts-editor{box-sizing:border-box;width:100%;min-height:200px;resize:vertical;padding:9px 11px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:18px;tab-size:2;outline:none;white-space:pre}",
      ".mts-editor:focus-visible{border-color:var(--dsw-alias-brand-primary)}",
      // 按钮
      ".mts-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".mts-spacer{flex:1}",
      ".mts-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 11px;box-sizing:border-box;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12.5px;line-height:18px;cursor:pointer;white-space:nowrap}",
      ".mts-btn:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-label-secondary) 10%,transparent)}",
      ".mts-btn:focus-visible{outline:none;border-color:var(--dsw-alias-brand-primary)}",
      ".mts-btn:disabled{opacity:.45;cursor:default}",
      ".mts-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}",
      ".mts-btn-primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary);opacity:.88}"
    ].join("");
    var THRESHOLD_MIN2 = 1;
    var THRESHOLD_MAX2 = 1e3;
    var OVERRIDES_TEMPLATE = JSON.stringify(
      [
        { key: "deepseek", label: "DeepSeek", prefixes: ["deepseek", "ds"] },
        { key: "my-family", label: "My Family", prefixes: ["myfam", "myfamily"] }
      ],
      null,
      2
    );
    function overridesTextOf(config) {
      const overrides = Array.isArray(config?.overrides) ? config.overrides : [];
      return JSON.stringify(overrides, null, 2);
    }
    function parseOverrides(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        return { ok: false, error: error && error.message || "JSON 解析失败" };
      }
      if (!Array.isArray(parsed)) return { ok: false, error: "规则必须是一个数组" };
      return { ok: true, value: parsed };
    }
    function parseThreshold(raw) {
      const text = String(raw ?? "").trim();
      if (text === "") return { ok: false, error: "阈值不能为空" };
      if (!/^\d+$/.test(text)) return { ok: false, error: "阈值必须是正整数" };
      const value = Number(text);
      if (value < THRESHOLD_MIN2 || value > THRESHOLD_MAX2) {
        return { ok: false, error: `阈值必须在 ${THRESHOLD_MIN2}..${THRESHOLD_MAX2} 之间` };
      }
      return { ok: true, value };
    }
    function SettingsPanel(props) {
      const t = typeof props?.t === "function" ? props.t : (key) => key;
      const [saved, setSaved] = import_react3.default.useState(() => loadConfig());
      const [totalModels, setTotalModels] = import_react3.default.useState(() => String(saved.thresholds.totalModels));
      const [perProvider, setPerProvider] = import_react3.default.useState(() => String(saved.thresholds.perProvider));
      const [rulesText, setRulesText] = import_react3.default.useState(() => overridesTextOf(saved));
      const [banner, setBanner] = import_react3.default.useState(null);
      const dirtyRef = import_react3.default.useRef(false);
      const markDirty = () => {
        dirtyRef.current = true;
      };
      const adopt = import_react3.default.useCallback((config) => {
        setSaved(config);
        setTotalModels(String(config.thresholds.totalModels));
        setPerProvider(String(config.thresholds.perProvider));
        setRulesText(overridesTextOf(config));
        dirtyRef.current = false;
      }, []);
      import_react3.default.useEffect(
        () => subscribeConfig((next) => {
          if (dirtyRef.current) return;
          adopt(next);
        }),
        [adopt]
      );
      const save = () => {
        const total = parseThreshold(totalModels);
        if (!total.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: total.error }) });
          return;
        }
        const per = parseThreshold(perProvider);
        if (!per.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: per.error }) });
          return;
        }
        const rules = parseOverrides(rulesText);
        if (!rules.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: rules.error }) });
          return;
        }
        const next = {
          ...saved,
          thresholds: { totalModels: total.value, perProvider: per.value },
          overrides: rules.value
        };
        const checked = validateConfig(next);
        if (!checked.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: checked.error }) });
          return;
        }
        const result = saveConfig(checked.value);
        if (!result.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: result.error }) });
          return;
        }
        adopt(checked.value);
        setBanner({ tone: "ok", text: t("settings.saved") });
      };
      const reset = () => {
        const next = {
          ...DEFAULT_CONFIG,
          thresholds: { ...DEFAULT_CONFIG.thresholds },
          overrides: []
        };
        const checked = validateConfig(next);
        if (!checked.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: checked.error }) });
          return;
        }
        const result = saveConfig(checked.value);
        if (!result.ok) {
          setBanner({ tone: "error", text: t("settings.invalid", { message: result.error }) });
          return;
        }
        adopt(checked.value);
        setBanner({ tone: "ok", text: t("settings.saved") });
      };
      const fillTemplate = () => {
        markDirty();
        setRulesText(OVERRIDES_TEMPLATE);
        setBanner(null);
      };
      const bannerEl = banner === null ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "div",
        {
          className: `mts-banner ${banner.tone === "error" ? "mts-banner-error" : "mts-banner-ok"}`,
          role: banner.tone === "error" ? "alert" : "status",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mts-banner-icon", children: banner.tone === "error" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconWarningOutlineRegular, { size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconCheckOutlineRegular, { size: 13 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mts-banner-txt", children: banner.text })
          ]
        }
      );
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "mts-root", "aria-label": t("nav"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("style", { children: CSS2 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mts-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "mts-title", children: t("nav") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "mts-intro", children: t("settings.intro") })
        ] }),
        bannerEl,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mts-block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "mts-block-head", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "mts-block-title", children: t("settings.thresholds") }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mts-fields", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "mts-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mts-field-label", children: t("settings.totalModels") }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "input",
                {
                  className: "mts-number",
                  type: "number",
                  min: THRESHOLD_MIN2,
                  max: THRESHOLD_MAX2,
                  step: 1,
                  value: totalModels,
                  onChange: (event) => {
                    markDirty();
                    setTotalModels(event.target.value);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "mts-field", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mts-field-label", children: t("settings.perProvider") }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                "input",
                {
                  className: "mts-number",
                  type: "number",
                  min: THRESHOLD_MIN2,
                  max: THRESHOLD_MAX2,
                  step: 1,
                  value: perProvider,
                  onChange: (event) => {
                    markDirty();
                    setPerProvider(event.target.value);
                  }
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mts-block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mts-block-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "mts-block-title", children: t("settings.rules") }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "mts-hint", children: t("settings.rulesHint") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "textarea",
            {
              className: "mts-editor",
              spellCheck: false,
              "aria-label": t("settings.rules"),
              value: rulesText,
              onChange: (event) => {
                markDirty();
                setRulesText(event.target.value);
                setBanner(null);
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mts-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "mts-btn", onClick: fillTemplate, children: t("settings.template") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "mts-btn", onClick: reset, children: t("settings.reset") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mts-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "mts-btn mts-btn-primary", onClick: save, children: t("settings.save") })
        ] })
      ] });
    }

    // src/client/index.js
    var SETTINGS_SECTION_ID = "model-tabs";
    var SETTINGS_SECTION_ORDER = 20;
    var MODEL_SEAT_PRIORITY = -1e3;
    var inject = ["slots", "locale"];
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-tabs: dictionaries");
      const t = ctx.locale.bind(NS);
      ctx.slots.inject(
        "settings.section",
        () => ctx.slots.register(
          {
            name: "settings.section",
            id: SETTINGS_SECTION_ID,
            order: SETTINGS_SECTION_ORDER,
            label: () => t("nav"),
            locale: NS
            // 声明命名空间 → 渲染器把 t 作为 prop 注入组件
          },
          SettingsPanel
        )
      );
      ctx.inject(["sessions", "modelDirectories"], (scope) => {
        const models = scope.modelDirectories;
        const sessions = scope.sessions;
        scope.slots.inject("conversation.input.model", () => {
          const injectModel = (sessionId) => {
            let controller;
            try {
              controller = models.directoryFor(sessionId);
            } catch (error) {
              console.error("[dsh-model-tabs] 解析模型目录失败，本会话退让给官方选择器：", error);
              return { available: false, directory: null, load: () => {
              }, select: () => Promise.resolve(void 0) };
            }
            const canSelect = () => sessions.subagentAddress(sessionId) === void 0;
            return {
              available: canSelect(),
              directory: controller.store,
              load: () => {
                if (canSelect()) controller.load().catch(() => {
                });
              },
              select: (selection) => canSelect() ? controller.select(selection) : Promise.resolve(void 0)
            };
          };
          const dispose = scope.slots.register(
            {
              name: "conversation.input.model",
              locale: NS,
              // 同上：注入 t
              priority: MODEL_SEAT_PRIORITY,
              // 稳压原生 0 与 reasoning-effort 的 -100
              inject: injectModel
            },
            ModelSeat
          );
          setSeatAbandon(dispose);
          const onScopeEffect = typeof scope.effect === "function" ? (fn, label) => scope.effect(fn, label) : (fn, label) => ctx.effect(fn, label);
          onScopeEffect(() => () => setSeatAbandon(null), "model-tabs: seat abandon");
          return dispose;
        });
      });
    }

    return module.exports;
  },
});
