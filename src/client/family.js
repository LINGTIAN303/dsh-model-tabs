// 模型族分类纯逻辑：把模型名归一成「族」，供模型选择器 Tab 分组使用。
// 本文件无 UI、无第三方依赖、无副作用，可在浏览器与 Node 中直接 import。

/**
 * 内置族规则。
 * prefixes 用「最长前缀命中」匹配，因此顺序只在同长度前缀冲突时决定归属（先到先得）。
 */
export const DEFAULT_RULES = [
  { key: 'deepseek', label: 'DeepSeek', prefixes: ['deepseek'] },
  { key: 'glm', label: 'GLM', prefixes: ['glm'] },
  { key: 'kimi', label: 'Kimi', prefixes: ['kimi', 'moonshot'] },
  { key: 'minimax', label: 'MiniMax', prefixes: ['minimax'] },
  { key: 'qwen', label: 'Qwen', prefixes: ['qwen'] },
  { key: 'doubao', label: '豆包', prefixes: ['doubao', 'seed'] },
  { key: 'hy', label: '混元', prefixes: ['hy', 'hunyuan'] },
  { key: 'ling', label: 'Ling', prefixes: ['ling'] },
  { key: 'mimo', label: 'MiMo', prefixes: ['mimo'] },
  { key: 'step', label: 'Step', prefixes: ['step'] },
  { key: 'gpt', label: 'GPT', prefixes: ['gpt'] },
  { key: 'claude', label: 'Claude', prefixes: ['claude'] },
  { key: 'gemini', label: 'Gemini', prefixes: ['gemini'] },
  { key: 'llama', label: 'Llama', prefixes: ['llama'] },
  { key: 'mistral', label: 'Mistral', prefixes: ['mistral'] },
  { key: 'space', label: 'Space', prefixes: ['space'] },
];

/**
 * 归一化模型名：取最后一个 '/' 之后 → 去掉 ':' 及之后 → 小写 → trim。
 * 例：'Qwen/Qwen-Image-2512' → 'qwen-image-2512'；'Qwen2-0.5B-Instruct:1mz' → 'qwen2-0.5b-instruct'
 * @param {unknown} name 原始模型名
 * @returns {string} 归一化后的名字，非字符串输入返回空串
 */
export function normalizeModelName(name) {
  if (typeof name !== 'string') return '';
  const slash = name.lastIndexOf('/'); // 去掉 'provider/' 这类前缀，只留模型名本体
  const base = slash >= 0 ? name.slice(slash + 1) : name;
  const colon = base.indexOf(':'); // 去掉 ':1mz' 这类量化/变体后缀
  const body = colon >= 0 ? base.slice(0, colon) : base;
  return body.trim().toLowerCase();
}

/**
 * 族 key 的首字母大写，用作未配置族的展示名。
 * @param {string} key
 * @returns {string}
 */
function capitalize(key) {
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : key;
}

/**
 * 分类模型所属族。
 * 顺序：最长前缀命中 → 前导字母回退 → other。
 * @param {unknown} name 模型名
 * @param {Array<{key:string,label:string,prefixes:string[]}>} [rules] 族规则，默认 DEFAULT_RULES
 * @returns {{key:string,label:string}}
 */
export function classifyFamily(name, rules = DEFAULT_RULES) {
  const normalized = normalizeModelName(name);
  const list = Array.isArray(rules) ? rules : [];

  let bestRule = null;
  let bestLength = 0;
  for (const rule of list) {
    if (!rule || typeof rule.key !== 'string' || !rule.key) continue; // 跳过残缺规则项
    if (!Array.isArray(rule.prefixes)) continue;
    for (const prefix of rule.prefixes) {
      if (typeof prefix !== 'string' || !prefix) continue; // 空前缀会命中一切，直接跳过
      // 只接受最长命中，保证 'qwen' 不会被更短的 'q' 类前缀抢走
      if (normalized.startsWith(prefix) && prefix.length > bestLength) {
        bestRule = rule;
        bestLength = prefix.length;
      }
    }
  }
  if (bestRule) return { key: bestRule.key, label: bestRule.label };

  const leading = normalized.match(/^[a-z]+/); // 未配置的族：用前导字母当族名
  if (leading) return { key: leading[0], label: capitalize(leading[0]) };

  return { key: 'other', label: '其他' };
}

/**
 * 按族分组。
 * @param {Array<{id?:string,name?:string}>|string[]} models 模型列表
 * @param {Array} [rules] 族规则
 * @returns {Array<{key:string,label:string,models:any[]}>} 族内模型数降序，同数量按 key 字典序
 */
export function groupByFamily(models, rules = DEFAULT_RULES) {
  const buckets = new Map();
  for (const model of Array.isArray(models) ? models : []) {
    // 与上层过滤逻辑保持一致：name 存在即用 name（含空串），否则退回 id
    const rawName = typeof model === 'string' ? model : (model && (model.name ?? model.id)) ?? '';
    const family = classifyFamily(rawName, rules);
    let bucket = buckets.get(family.key);
    if (!bucket) {
      bucket = { key: family.key, label: family.label, models: [] };
      buckets.set(family.key, bucket);
    }
    bucket.models.push(model); // 保留原始对象引用，上层无需二次查找
  }
  return [...buckets.values()].sort((a, b) => {
    if (b.models.length !== a.models.length) return b.models.length - a.models.length; // 模型多的族排前面
    return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; // 同数量按 key 字典序，保证渲染顺序稳定
  });
}
