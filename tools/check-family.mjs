// 回归检查脚本：校验 family.js / config.js 的契约行为。
// 运行：node tools/check-family.mjs  —— 全部通过 exit 0，否则打印失败项并 exit 1。
// 无第三方依赖（不读 cordis.patch.yml，避免引入 yaml 解析依赖）。

import { DEFAULT_RULES, normalizeModelName, classifyFamily, groupByFamily } from '../src/client/family.js';
import {
  CONFIG_KEY,
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  effectiveRules,
  subscribeConfig,
  validateConfig,
} from '../src/client/config.js';

const failures = [];
let passed = 0;

/**
 * 记录一条断言结果。
 * @param {string} name 用例名
 * @param {boolean} ok 是否通过
 * @param {string} [detail] 失败时的补充信息
 */
function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(detail ? `${name} —— ${detail}` : name);
    console.log(`  FAIL  ${name}${detail ? ` —— ${detail}` : ''}`);
  }
}

/**
 * 断言分类结果等于期望 key。
 * @param {unknown} name 模型名
 * @param {string} expected 期望族 key
 */
function checkFamily(name, expected) {
  const result = classifyFamily(name);
  const actual = result && result.key;
  check(`classifyFamily(${JSON.stringify(name)}) === ${expected}`, actual === expected, `实际 ${actual}`);
}

/**
 * 断言两个模型名归入同一族。
 * @param {unknown} a
 * @param {unknown} b
 * @param {string} expected 期望的共同族 key
 */
function checkSameFamily(a, b, expected) {
  const ka = classifyFamily(a).key;
  const kb = classifyFamily(b).key;
  const ok = ka === expected && kb === expected;
  check(`${JSON.stringify(a)} 与 ${JSON.stringify(b)} 同族 ${expected}`, ok, `实际 ${ka} / ${kb}`);
}

/** 构造一个内存版 Storage，用于 config 用例。 */
function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
  };
}

console.log('== 1. normalizeModelName 归一化 ==');
check('去 provider 前缀与变体后缀', normalizeModelName('Qwen/Qwen2-0.5B-Instruct:1mz') === 'qwen2-0.5b-instruct', `实际 ${normalizeModelName('Qwen/Qwen2-0.5B-Instruct:1mz')}`);
check('全大写转小写并 trim', normalizeModelName('  GLM-5.3-Flash  ') === 'glm-5.3-flash', `实际 ${normalizeModelName('  GLM-5.3-Flash  ')}`);
check('非字符串返回空串', normalizeModelName(null) === '' && normalizeModelName(undefined) === '', 'null/undefined 应返回空串');

console.log('== 2. 回归用例：族合并 ==');
checkSameFamily('Qwen/Qwen-Image-2512', 'qwen3.8-max', 'qwen');
checkSameFamily('hy4free', 'hy3', 'hy');
checkSameFamily('hy4std', 'hy3', 'hy');
checkSameFamily('Ling-3.0-flash-Sante', 'lingdt-xxx', 'ling');
checkSameFamily('Doubao-Seed-2.0-Code', 'Seed-Code', 'doubao');
checkFamily('GLM-5.3-Flash', 'glm');
checkFamily('DeepSeek-V4.1-Flash', 'deepseek');
checkFamily('Kimi-K3.1-Pro', 'kimi');
checkFamily('MiniMax-M3.1-Flash', 'minimax');
checkFamily('text-embedding-3-small', 'text');
checkFamily('Qwen2-0.5B-Instruct:1mz', 'qwen');
checkFamily('', 'other');
checkFamily(null, 'other');
checkFamily('123-abc', 'other');

console.log('== 3. 前缀与最长命中 ==');
checkFamily('moonshot-v1-128k', 'kimi');
checkFamily('hunyuan-lite', 'hy');
checkFamily('GPT-4o', 'gpt');
checkFamily('Claude-3.5-Sonnet', 'claude');
checkFamily('Gemini-2.5-Pro', 'gemini');
checkFamily('Llama-3.1-70B', 'llama');
checkFamily('Mistral-Large', 'mistral');
checkFamily('Space-Code', 'space');
checkFamily('MiMo-7B', 'mimo');
checkFamily('Step-2', 'step');
check('未配置族回退前导字母并首字母大写', classifyFamily('foo-bar').key === 'foo' && classifyFamily('foo-bar').label === 'Foo', `实际 ${JSON.stringify(classifyFamily('foo-bar'))}`);
check('默认规则条数为 16', DEFAULT_RULES.length === 16, `实际 ${DEFAULT_RULES.length}`);
check('规则结构完整', DEFAULT_RULES.every((r) => r.key && r.label && Array.isArray(r.prefixes) && r.prefixes.length > 0), '存在残缺规则');
check('自定义规则优先于默认前缀', classifyFamily('hy4free', [{ key: 'custom', label: 'Custom', prefixes: ['hy4'] }]).key === 'custom', '自定义最长前缀应胜出');
check('更长前缀胜过更短前缀', classifyFamily('minimax', [{ key: 'mini', label: 'Mini', prefixes: ['mini'] }, { key: 'minimax', label: 'MiniMax', prefixes: ['minimax'] }]).key === 'minimax', '最长前缀应胜出');

console.log('== 4. groupByFamily 分组与排序 ==');
const sampleModels = [
  { id: 'a', name: 'Qwen/Qwen-Image-2512' },
  { id: 'b', name: 'hy4free' },
  { id: 'c', name: 'hy3' },
  { id: 'd', name: 'GLM-5.3-Flash' },
  { id: 'e', name: 'DeepSeek-V4.1-Flash' },
];
const groups = groupByFamily(sampleModels);
check('分组数量为 4', groups.length === 4, `实际 ${groups.length}`);
check('首组为 hy（模型数最多）', groups[0].key === 'hy' && groups[0].models.length === 2, `实际 ${groups[0].key}/${groups[0].models.length}`);
check('首组 label 为 混元', groups[0].label === '混元', `实际 ${groups[0].label}`);
check('同数量按 key 字典序', groups.slice(1).map((g) => g.key).join(',') === 'deepseek,glm,qwen', `实际 ${groups.slice(1).map((g) => g.key).join(',')}`);
check('保留原始模型对象引用', groups.find((g) => g.key === 'hy').models[0] === sampleModels[1], '引用不一致');
check('空输入返回空数组', groupByFamily([]).length === 0, '空数组应返回空数组');
check('非数组输入不抛错', groupByFamily(null).length === 0, 'null 应返回空数组');
check('字符串数组输入可用', groupByFamily(['qwen3', 'qwen3'])[0].models.length === 2, '字符串模型名应可分组');
// 与上层 ModelTabs 过滤口径一致：取 name ?? id（name 为空串时不回退 id）
check('name 为空串时按空串归类（与 name ?? id 口径一致）', classifyFamily('' ) .key === 'other' && groupByFamily([{ id: 'x1', name: '' }])[0].key === 'other', '口径不一致');
check('无 name 时回退 id', groupByFamily([{ id: 'hy3' }])[0].key === 'hy', `实际 ${groupByFamily([{ id: 'hy3' }])[0].key}`);

console.log('== 5. config.js 契约 ==');
check('CONFIG_KEY 正确', CONFIG_KEY === 'dsh-model-tabs.config', `实际 ${CONFIG_KEY}`);
check('DEFAULT_CONFIG 默认值正确', DEFAULT_CONFIG.version === 1 && DEFAULT_CONFIG.thresholds.totalModels === 20 && DEFAULT_CONFIG.thresholds.perProvider === 30 && Array.isArray(DEFAULT_CONFIG.overrides) && DEFAULT_CONFIG.overrides.length === 0, '默认配置不符合契约');
check('DEFAULT_CONFIG.rules 内容与内置规则一致', DEFAULT_CONFIG.rules.length === DEFAULT_RULES.length && DEFAULT_CONFIG.rules.every((rule, i) => rule.key === DEFAULT_RULES[i].key && rule.label === DEFAULT_RULES[i].label && rule.prefixes.join(',') === DEFAULT_RULES[i].prefixes.join(',')), 'rules 内容应等同于 DEFAULT_RULES');
// 防御性快照：公开导出的常量不能与 DEFAULT_RULES 共享引用，否则外部一次改动就污染全局默认
check('DEFAULT_CONFIG.rules 与 DEFAULT_RULES 不是同一引用', DEFAULT_CONFIG.rules !== DEFAULT_RULES, '两者不应共享数组引用');
check('DEFAULT_CONFIG.rules 首项与 DEFAULT_RULES 首项不是同一引用', DEFAULT_CONFIG.rules[0] !== DEFAULT_RULES[0], '两者不应共享规则对象引用');
check('DEFAULT_CONFIG.rules 的 prefixes 也不是共享数组', DEFAULT_CONFIG.rules[0].prefixes !== DEFAULT_RULES[0].prefixes, 'prefixes 数组不应共享引用');
// 反向验证：改 DEFAULT_CONFIG 的副本不影响 DEFAULT_RULES
DEFAULT_CONFIG.rules[0].label = '污染测试';
check('改 DEFAULT_CONFIG.rules 不影响 DEFAULT_RULES', DEFAULT_RULES[0].label === 'DeepSeek', `实际 ${DEFAULT_RULES[0].label}`);
DEFAULT_CONFIG.rules[0].label = DEFAULT_RULES[0].label;

const storage = createMemoryStorage();
const emptyLoad = loadConfig(storage);
check('未保存时 loadConfig 返回默认值', emptyLoad.version === 1 && emptyLoad.thresholds.totalModels === 20, `实际 ${JSON.stringify(emptyLoad.thresholds)}`);

const saveResult = saveConfig({ ...emptyLoad, thresholds: { totalModels: 50, perProvider: 10 } }, storage);
check('saveConfig 成功返回 ok:true', saveResult.ok === true, JSON.stringify(saveResult));
const reloaded = loadConfig(storage);
check('saveConfig 后可读回', reloaded.thresholds.totalModels === 50 && reloaded.thresholds.perProvider === 10, `实际 ${JSON.stringify(reloaded.thresholds)}`);

storage.setItem(CONFIG_KEY, '{ 坏 JSON');
check('损坏 JSON 静默回退默认', loadConfig(storage).thresholds.totalModels === 20, '应回退默认');

const throwingStorage = {
  getItem: () => { throw new Error('boom'); },
  setItem: () => { throw new Error('boom'); },
};
check('storage 抛错时 loadConfig 回退默认', loadConfig(throwingStorage).thresholds.totalModels === 20, '应回退默认');
check('storage 抛错时 saveConfig 返回失败', saveConfig({ version: 1, thresholds: { totalModels: 20, perProvider: 30 }, rules: [], overrides: [] }, throwingStorage).ok === false, '应返回 ok:false');
check('storage 缺失时 loadConfig 回退默认', loadConfig({}).thresholds.totalModels === 20, '应回退默认');

const invalidVersion = validateConfig({ version: 2, thresholds: {}, rules: [], overrides: [] });
check('version !== 1 校验失败', invalidVersion.ok === false, JSON.stringify(invalidVersion));
const nonObject = validateConfig(null);
check('非对象校验失败', nonObject.ok === false, JSON.stringify(nonObject));

const partial = validateConfig({
  version: 1,
  thresholds: { totalModels: 0, perProvider: 5000 },
  rules: [
    { key: 'ok', label: 'OK', prefixes: ['ok'] },
    { key: '', label: '空 key', prefixes: ['x'] },
    { key: 'bad', label: 'Bad', prefixes: [] },
    { key: 'upper', label: 'Upper', prefixes: ['UP'] },
    { key: 'space', label: 'Space', prefixes: ['a b'] },
    { key: 'num', label: 'Num', prefixes: [1] },
    'not-a-rule',
  ],
  overrides: 'not-an-array',
});
check('越界阈值回退默认值', partial.ok && partial.value.thresholds.totalModels === 20 && partial.value.thresholds.perProvider === 30, JSON.stringify(partial.ok && partial.value.thresholds));
check('非法规则项被逐条丢弃且保留合法项', partial.ok && partial.value.rules.length === 1 && partial.value.rules[0].key === 'ok', JSON.stringify(partial.ok && partial.value.rules.map((r) => r.key)));
check('overrides 非数组回退空数组', partial.ok && Array.isArray(partial.value.overrides) && partial.value.overrides.length === 0, '应回退空数组');

const effective = effectiveRules({
  version: 1,
  thresholds: { totalModels: 20, perProvider: 30 },
  rules: DEFAULT_RULES,
  overrides: [
    { key: 'qwen', label: '通义千问', prefixes: ['qwen', 'tongyi'] },
    { key: 'newfam', label: 'NewFam', prefixes: ['new'] },
  ],
});
const qwenRule = effective.find((r) => r.key === 'qwen');
check('overrides 同 key 原位覆盖', qwenRule && qwenRule.label === '通义千问' && qwenRule.prefixes.includes('tongyi'), JSON.stringify(qwenRule));
check('overrides 新 key 追加到末尾', effective[effective.length - 1].key === 'newfam', `实际 ${effective[effective.length - 1].key}`);
check('effectiveRules 长度正确', effective.length === DEFAULT_RULES.length + 1, `实际 ${effective.length}`);
check('effectiveRules 不污染 DEFAULT_RULES', DEFAULT_RULES.find((r) => r.key === 'qwen').label === 'Qwen', '默认规则被改动');
check('覆盖规则参与分类', classifyFamily('tongyi-qwen', effective).key === 'qwen', `实际 ${classifyFamily('tongyi-qwen', effective).key}`);

const events = [];
const unsubscribe = subscribeConfig((cfg) => events.push(cfg), storage);
saveConfig({ ...emptyLoad, thresholds: { totalModels: 21, perProvider: 30 } }, storage);
check('saveConfig 触发本地订阅者', events.length === 1 && events[0].thresholds.totalModels === 21, `实际 ${events.length} 次`);
unsubscribe();
saveConfig({ ...emptyLoad, thresholds: { totalModels: 22, perProvider: 30 } }, storage);
check('unsubscribe 后不再收到通知', events.length === 1, `实际 ${events.length} 次`);
check('subscribeConfig 非函数参数返回空 unsubscribe', typeof subscribeConfig(null) === 'function', '应返回函数');

console.log('');
console.log(`== 汇总：通过 ${passed} 项，失败 ${failures.length} 项 ==`);
if (failures.length > 0) {
  console.log('');
  console.log('失败清单：');
  for (const item of failures) console.log(`  - ${item}`);
  process.exit(1);
}
console.log('全部通过');
process.exit(0);
