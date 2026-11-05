// 插件配置纯逻辑：读写 localStorage、校验、合并、规则生效与订阅。
// 无 UI、无第三方依赖；storage 可注入，便于在 Node 中测试。

import { DEFAULT_RULES } from './family.js';

/** localStorage 中保存配置使用的键名。 */
export const CONFIG_KEY = 'dsh-model-tabs.config';

/** 配置版本号，结构变更时递增。 */
export const CONFIG_VERSION = 1;

/**
 * 内置默认配置（请勿原地修改；读配置请用 loadConfig）。
 * rules 存的是克隆快照而非 DEFAULT_RULES 本身：本对象对外公开导出，
 * 若与 DEFAULT_RULES 共享引用，外部一次 push / 改 label 就会污染全局默认。
 */
export const DEFAULT_CONFIG = {
  version: CONFIG_VERSION,
  thresholds: { totalModels: 20, perProvider: 30 },
  rules: DEFAULT_RULES.map(cloneRule), // 内置默认族规则的克隆快照
  overrides: [], // 用户自定义/覆盖规则
};

/** 阈值合法区间。 */
const THRESHOLD_MIN = 1;
const THRESHOLD_MAX = 1000;

/** 本地 setter 的订阅者集合（跨标签页由 storage 事件补足）。 */
const localListeners = new Set();

/**
 * 判断是否为普通对象（排除 null / 数组）。
 * @param {unknown} value
 * @returns {boolean}
 */
function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 解析可用的 storage：显式传入优先，否则取全局 localStorage。
 * @param {Storage|null|undefined} storage
 * @returns {Storage|null}
 */
function resolveStorage(storage) {
  if (storage && typeof storage.getItem === 'function') return storage;
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  } catch {
    // 某些环境访问 localStorage 会抛异常（隐私模式等），静默忽略
  }
  return null;
}

/**
 * 克隆单条族规则，避免调用方改动污染常量。
 * @param {{key:string,label:string,prefixes:string[]}} rule
 * @returns {{key:string,label:string,prefixes:string[]}}
 */
function cloneRule(rule) {
  return { key: rule.key, label: rule.label, prefixes: rule.prefixes.slice() };
}

/**
 * 生成一份全新的默认配置副本。
 * @returns {typeof DEFAULT_CONFIG}
 */
function cloneDefaultConfig() {
  return {
    version: CONFIG_VERSION,
    thresholds: { ...DEFAULT_CONFIG.thresholds },
    rules: DEFAULT_RULES.map(cloneRule),
    overrides: [],
  };
}

/**
 * 校验单条族规则；不合法返回 null。
 * key 非空、label 为字符串、prefixes 为非空数组且每项全小写、无空格。
 * @param {unknown} raw
 * @returns {{key:string,label:string,prefixes:string[]}|null}
 */
function validateRule(raw) {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.key !== 'string' || !raw.key.trim()) return null;
  if (typeof raw.label !== 'string') return null;
  if (!Array.isArray(raw.prefixes) || raw.prefixes.length === 0) return null;

  const prefixes = [];
  for (const prefix of raw.prefixes) {
    if (typeof prefix !== 'string') return null; // 单个 prefix 类型不对，整条规则丢弃
    const trimmed = prefix.trim();
    if (!trimmed) return null;
    if (trimmed !== trimmed.toLowerCase()) return null; // prefix 必须全小写
    if (/\s/.test(trimmed)) return null; // prefix 不含空格
    prefixes.push(trimmed);
  }
  if (prefixes.length === 0) return null;

  const key = raw.key.trim();
  const label = raw.label.trim() || key; // label 允许为空，此时回退到 key
  return { key, label, prefixes };
}

/**
 * 校验规则数组；非数组时回退 fallback，数组内非法项丢弃。
 * @param {unknown} raw
 * @param {Array} [fallback]
 * @returns {Array<{key:string,label:string,prefixes:string[]}>}
 */
function validateRuleList(raw, fallback = []) {
  if (!Array.isArray(raw)) return fallback.map(cloneRule);
  const result = [];
  for (const item of raw) {
    const rule = validateRule(item);
    if (rule) result.push(rule); // 非法项丢弃，不影响其余合法项
  }
  return result;
}

/**
 * 校验阈值字段：必须是 1..1000 的正整数，否则回退默认值。
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function validateThreshold(value, fallback) {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  if (value < THRESHOLD_MIN || value > THRESHOLD_MAX) return fallback;
  return value;
}

/**
 * 校验配置对象。
 * 顶层结构错误（非对象 / version 不符）返回 ok:false；其余问题按字段静默回退默认。
 * @param {unknown} raw
 * @returns {{ok:true, value:object}|{ok:false, error:string}}
 */
export function validateConfig(raw) {
  if (!isPlainObject(raw)) return { ok: false, error: '配置必须是对象' };
  if (raw.version !== CONFIG_VERSION) {
    return { ok: false, error: `version 必须为 ${CONFIG_VERSION}` };
  }

  const sourceThresholds = isPlainObject(raw.thresholds) ? raw.thresholds : {};
  const value = {
    version: CONFIG_VERSION,
    thresholds: {
      totalModels: validateThreshold(sourceThresholds.totalModels, DEFAULT_CONFIG.thresholds.totalModels),
      perProvider: validateThreshold(sourceThresholds.perProvider, DEFAULT_CONFIG.thresholds.perProvider),
    },
    // 非数组回退内置规则；数组内非法项逐条丢弃
    rules: validateRuleList(raw.rules, DEFAULT_RULES),
    overrides: validateRuleList(raw.overrides, []),
  };
  return { ok: true, value };
}

/**
 * 读取配置：读 → 解析 → 校验 → 合并默认值；任何异常静默回退默认配置。
 * @param {Storage} [storage] 默认使用 localStorage
 * @returns {object}
 */
export function loadConfig(storage) {
  try {
    const store = resolveStorage(storage);
    if (!store) return cloneDefaultConfig();
    const raw = store.getItem(CONFIG_KEY);
    if (raw == null || raw === '') return cloneDefaultConfig(); // 未保存过配置
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result = validateConfig(parsed);
    return result.ok ? result.value : cloneDefaultConfig();
  } catch {
    return cloneDefaultConfig(); // JSON 损坏 / storage 抛错等情况静默回退
  }
}

/**
 * 通知本地订阅者（saveConfig 调用，跨标签页由 storage 事件另行触发）。
 * @param {object} config
 */
function notifyLocal(config) {
  for (const listener of [...localListeners]) {
    try {
      listener(config);
    } catch {
      // 单个订阅者抛错不影响其它订阅者
    }
  }
}

/**
 * 保存配置：先校验再写入；失败返回 { ok:false, error }。
 * @param {object} config
 * @param {Storage} [storage] 默认使用 localStorage
 * @returns {{ok:true}|{ok:false,error:string}}
 */
export function saveConfig(config, storage) {
  const result = validateConfig(config);
  if (!result.ok) return { ok: false, error: result.error || '配置校验失败' };

  const store = resolveStorage(storage);
  if (!store || typeof store.setItem !== 'function') return { ok: false, error: 'storage 不可用' };

  try {
    store.setItem(CONFIG_KEY, JSON.stringify(result.value));
  } catch (error) {
    return { ok: false, error: (error && error.message) || '写入失败' };
  }
  notifyLocal(result.value); // 本地写入后同步通知当前标签页订阅者
  return { ok: true };
}

/**
 * 计算最终生效的族规则：overrides 按 key 覆盖同 key 默认规则，新 key 追加。
 * @param {object} config
 * @returns {Array<{key:string,label:string,prefixes:string[]}>}
 */
export function effectiveRules(config) {
  const source = isPlainObject(config) ? config : DEFAULT_CONFIG;
  const merged = validateRuleList(source.rules, DEFAULT_RULES);
  const indexByKey = new Map();
  merged.forEach((rule, index) => indexByKey.set(rule.key, index));

  for (const override of validateRuleList(source.overrides, [])) {
    const index = indexByKey.get(override.key);
    if (index === undefined) {
      indexByKey.set(override.key, merged.length); // 新 key 追加到末尾
      merged.push(override);
    } else {
      merged[index] = override; // 同 key 原位覆盖，保持默认顺序
    }
  }
  return merged;
}

/**
 * 订阅配置变化：监听 localStorage 跨标签页事件 + 本标签页 saveConfig 通知。
 * @param {(config:object)=>void} listener
 * @param {Storage} [storage] 默认使用 localStorage
 * @returns {() => void} 取消订阅
 */
export function subscribeConfig(listener, storage) {
  if (typeof listener !== 'function') return () => {};
  localListeners.add(listener);

  const store = resolveStorage(storage);
  const target = typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function' ? globalThis : null;
  const onStorage = (event) => {
    if (event && typeof event.key === 'string' && event.key !== CONFIG_KEY) return; // 只关心本插件配置键
    try {
      listener(loadConfig(store || undefined));
    } catch {
      // 订阅者抛错不应打断事件派发
    }
  };

  // storage 事件按浏览器规范派发在 window 上；store 自身支持时也挂一份以兼容自定义 storage
  const storeHasEvents = store && typeof store.addEventListener === 'function';
  if (storeHasEvents) store.addEventListener('storage', onStorage);
  if (target) target.addEventListener('storage', onStorage);

  return () => {
    localListeners.delete(listener);
    if (storeHasEvents) store.removeEventListener('storage', onStorage);
    if (target) target.removeEventListener('storage', onStorage);
  };
}
