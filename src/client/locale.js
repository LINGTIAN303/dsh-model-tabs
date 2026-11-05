/**
 * dsh-model-tabs —— 本地化字典
 *
 * 说明：DSH 的 locale 服务按「命名空间」注册字典，组件通过注册时声明的
 * `locale: NS` 拿到 `t(key, params?)`。带参数的键用 `{name}` 占位。
 *
 * 键表由 ModelTabs.js 与 SettingsPanel.js 共用，新增文案时两边同步。
 */

/** 本插件的 locale 命名空间。 */
export const NS = 'model-tabs';

/** 简体中文字典（键集的事实来源）。 */
export const zh = {
  // 提供方与 Tab
  'provider.account': 'DeepSeek 账号',
  'tabs.all': '全部',
  'tabs.providersAria': '按提供商筛选模型',
  'tabs.familiesAria': '按模型系列筛选',

  // 触发器
  'trigger.fallback': '请选择模型',
  'trigger.loading': '正在加载模型…',
  'trigger.selectAria': '请选择模型',
  'trigger.aria': '当前模型：{model}',
  'trigger.ariaEffort': '当前模型：{model}，推理等级：{effort}',

  // 菜单
  'menu.aria': '模型选择',
  'menu.model': '模型',
  'menu.effort': '推理等级',

  // 搜索
  'search.placeholder': '搜索模型',
  'search.clear': '清除搜索',
  'search.empty': '没有匹配的模型',

  // 状态
  'status.loading': '正在加载模型…',
  'empty.models': '没有可用模型',
  'empty.efforts': '该模型没有推理等级选项',

  // 错误
  'error.action': '操作失败：{message}',
  'error.sessionInUse': '该会话被其他窗口占用，请关闭其它 DSH 窗口后重试',
  'warning.groupLoad': '{name} 目录加载失败：{message}',
  retry: '重试',
  'action.reload': '重新加载',

  // 推理等级
  'effort.providerDefault': '提供商默认',

  // 设置页
  nav: '模型 Tab',
  'settings.intro': '大目录时在模型列表上方显示提供商与模型系列两级 Tab，减少滚动翻找。小目录自动保持官方平铺样式。',
  'settings.thresholds': '生效阈值',
  'settings.totalModels': '模型总数超过',
  'settings.perProvider': '或单个提供商模型数超过',
  'settings.rules': '模型系列规则',
  'settings.rulesHint': '按前缀识别系列，最长前缀优先命中；未命中时回退取模型名的前导字母。',
  'settings.template': '填入模板',
  'settings.save': '保存',
  'settings.reset': '恢复默认',
  'settings.saved': '已保存',
  'settings.invalid': '配置无效：{message}',
};

/** English dictionary（键集与 zh 一致）。 */
export const en = {
  'provider.account': 'DeepSeek Account',
  'tabs.all': 'All',
  'tabs.providersAria': 'Filter models by provider',
  'tabs.familiesAria': 'Filter models by family',

  'trigger.fallback': 'Select model',
  'trigger.loading': 'Loading models…',
  'trigger.selectAria': 'Select model',
  'trigger.aria': 'Current model: {model}',
  'trigger.ariaEffort': 'Current model: {model}, reasoning effort: {effort}',

  'menu.aria': 'Model selection',
  'menu.model': 'Model',
  'menu.effort': 'Reasoning effort',

  'search.placeholder': 'Search models',
  'search.clear': 'Clear search',
  'search.empty': 'No matching models',

  'status.loading': 'Loading models…',
  'empty.models': 'No models available',
  'empty.efforts': 'This model has no reasoning effort options',

  'error.action': 'Action failed: {message}',
  'error.sessionInUse': 'This session is owned by another window. Quit other DSH instances and retry.',
  'warning.groupLoad': 'Failed to load {name}: {message}',
  retry: 'Retry',
  'action.reload': 'Reload',

  'effort.providerDefault': 'Provider default',

  nav: 'Model Tabs',
  'settings.intro': 'Shows provider and model-family tabs above the model list for large catalogs, cutting scroll and visual noise. Small catalogs keep the official flat list.',
  'settings.thresholds': 'Activation thresholds',
  'settings.totalModels': 'Total models above',
  'settings.perProvider': 'Or models in one provider above',
  'settings.rules': 'Model family rules',
  'settings.rulesHint': 'Families are matched by prefix, longest prefix wins; a miss falls back to the model name leading letters.',
  'settings.template': 'Fill template',
  'settings.save': 'Save',
  'settings.reset': 'Reset to default',
  'settings.saved': 'Saved',
  'settings.invalid': 'Invalid config: {message}',
};
