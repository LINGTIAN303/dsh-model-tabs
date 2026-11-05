// 座位守卫：把模型座位的渲染错误记录下来，并主动让位给官方选择器。
//
// 为什么需要它：
//   `conversation.input.model` 是 single 槽，按 priority 升序取第一个未被退位的条目。
//   我们注册在 -1000 稳压官方 0，但一旦组件在真实环境渲染抛错，DSH 的 SlotErrorBoundary
//   会把该条目放进 abdicated 集合（entriesOfSlot 直接跳过它），官方条目随即接管 ——
//   表现就是「插件装了、设置页也在，但 Tab 根本没上屏」，且没有任何可见报错。
//   实测 `Slots.listSubTree` 里我们的条目 `active:false` 正是这个状态。
//
// 本模块的两个职责：
//   1. recordRenderError：把错误落到 localStorage（浏览器端唯一可被外部读取的通道）
//   2. abandonSeat：主动注销自己的座位，让官方选择器立刻接替，避免「槽被我们占住却没有 UI」
//
// 这两个动作都是幂等的，且任何一步失败都静默吞掉 —— 诊断代码本身绝不能二次抛错。

/** 诊断记录写入的 localStorage 键名（与配置键分开，避免污染用户配置）。 */
export const DIAG_KEY = 'dsh-model-tabs.lastError';

/** 当前座位的注销函数；由装配层在注册成功后注入。 */
let abandon = null;

/**
 * 注册「主动让位」回调。
 * @param {(() => void)|null} fn 座位注册返回的 disposer
 */
export function setSeatAbandon(fn) {
  abandon = typeof fn === 'function' ? fn : null;
}

/** 主动注销座位，让官方选择器接管。失败静默。 */
export function abandonSeat() {
  const fn = abandon;
  abandon = null; // 只让位一次，避免重复注销
  if (fn === null) return;
  try {
    fn();
  } catch {
    // 让位失败不额外抛错：此时 DSH 自己的错误边界仍会兜底
  }
}

/**
 * 记录一次渲染错误。
 * @param {unknown} error 抛出的错误
 * @param {{componentStack?: string}|undefined} info React 错误信息
 */
export function recordRenderError(error, info) {
  const record = {
    time: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error && typeof error.stack === 'string' ? error.stack.slice(0, 4000) : null,
    componentStack:
      info !== undefined && typeof info.componentStack === 'string'
        ? info.componentStack.slice(0, 4000)
        : null,
  };
  try {
    globalThis.localStorage?.setItem(DIAG_KEY, JSON.stringify(record));
  } catch {
    // localStorage 不可用（隐私模式 / 配额）时放弃持久化，仍有下面的 console
  }
  try {
    globalThis.console?.error('[dsh-model-tabs] 模型座位渲染失败，已让位给官方选择器：', error, info);
  } catch {
    // console 被禁用时不额外抛错
  }
}
