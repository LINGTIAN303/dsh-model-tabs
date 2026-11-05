/**
 * dsh-model-tabs —— Client（浏览器）半边：插件装配
 *
 * 两件事：
 *   1. 注册 `conversation.input.model` 槽（single，session scope），用 `priority: -1000`
 *      遮蔽官方原生选择器（原生 0，reasoning-effort 兜底 -100，越小越优先渲染）。
 *   2. 注册 `settings.section` 槽（list，root scope），在设置里加一页族规则/阈值编辑页。
 *
 * 退让策略（关键）：
 *   · 设置页只依赖 `slots` + `locale`，模型目录缺失时依然可用（配置还能编辑）。
 *   · 模型座位额外依赖 `sessions` + `modelDirectories`，用 `ctx.inject` 等待；
 *     任一缺失时回调不执行 → 我们不注册槽 → 官方选择器照常上屏，不报错。
 *     这比把两个服务写进顶层 inject 更稳：后者会让整个插件（含设置页）一起失活。
 *
 * 说明：`ModelTabs.js` 由 Lead 实现，`locale.js` 提供全量键表，`config.js` 提供配置读写，
 * 本文件只做装配，不含业务逻辑。
 */

import { NS, zh, en } from './locale.js';
import ModelSeat from './ModelSeat.js';
import SettingsPanel from './SettingsPanel.js';
import { setSeatAbandon } from './seat.js';

/** 设置页在设置导航里的条目 id（也是 `only` 过滤用的键）。 */
const SETTINGS_SECTION_ID = 'model-tabs';

/** 设置页在导航中的排序位（官方 general/models/plugins 之间，取 20 避开拥挤区）。 */
const SETTINGS_SECTION_ORDER = 20;

/** 模型座位在 single 槽里的渲染优先级：必须小于原生 0 与 reasoning-effort 的 -100。 */
const MODEL_SEAT_PRIORITY = -1000;

/** 插件必需服务：槽注册表 + 本地化（设置页与座位都要用）。 */
export const inject = ['slots', 'locale'];

/**
 * 插件装配入口。
 * @param {object} ctx 客户端根上下文
 */
export function apply(ctx) {
  // 字典注册随插件生命周期，卸载时自动撤销
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-tabs: dictionaries');

  const t = ctx.locale.bind(NS);

  // ── 设置页：list 槽，必须有 id + order；label 用 thunk 以便切语言时重新求值 ──
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: SETTINGS_SECTION_ID,
        order: SETTINGS_SECTION_ORDER,
        label: () => t('nav'),
        locale: NS, // 声明命名空间 → 渲染器把 t 作为 prop 注入组件
      },
      SettingsPanel,
    ),
  );

  // ── 模型座位：等待 sessions + modelDirectories；缺失即静默退让 ──
  ctx.inject(['sessions', 'modelDirectories'], (scope) => {
    const models = scope.modelDirectories;
    const sessions = scope.sessions;

    scope.slots.inject('conversation.input.model', () => {
      /**
       * 槽注入面：按 sessionId 解析该会话的模型目录，并给出 store + 三个动作。
       * 形态与官方 `ModelSelect` 的 inject 一致，ModelTabs 直接解构使用。
       * @param {string} sessionId 会话 id
       * @returns {{available:boolean, directory:object, load:Function, select:Function}}
       */
      const injectModel = (sessionId) => {
        // directoryFor 对未知会话会抛错；这里必须兜住：inject 回调抛错会让整个座位
        // 注册失败（连组件都上不了屏），而正确行为应是「本会话不可选模型 → 退让」。
        let controller;
        try {
          controller = models.directoryFor(sessionId);
        } catch (error) {
          console.error('[dsh-model-tabs] 解析模型目录失败，本会话退让给官方选择器：', error);
          return { available: false, directory: null, load: () => {}, select: () => Promise.resolve(undefined) };
        }
        // 被寻址的子代理会话不允许改模型（与官方行为一致）
        const canSelect = () => sessions.subagentAddress(sessionId) === undefined;
        return {
          available: canSelect(),
          directory: controller.store,
          load: () => {
            if (canSelect()) controller.load().catch(() => {});
          },
          select: (selection) =>
            canSelect() ? controller.select(selection) : Promise.resolve(undefined),
        };
      };

      const dispose = scope.slots.register(
        {
          name: 'conversation.input.model',
          locale: NS, // 同上：注入 t
          priority: MODEL_SEAT_PRIORITY, // 稳压原生 0 与 reasoning-effort 的 -100
          inject: injectModel,
        },
        ModelSeat,
      );

      // 座位渲染抛错时由守卫主动注销，官方选择器立刻接替。
      // 清理优先挂当前作用域；inject 回调参数不保证带 effect()，退回插件根 ctx。
      setSeatAbandon(dispose);
      const onScopeEffect =
        typeof scope.effect === 'function'
          ? (fn, label) => scope.effect(fn, label)
          : (fn, label) => ctx.effect(fn, label);
      onScopeEffect(() => () => setSeatAbandon(null), 'model-tabs: seat abandon');

      return dispose;
    });
  });
}
