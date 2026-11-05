// 模型座位的注册入口：用错误边界包住 ModelTabs。
//
// 为什么不在 ModelTabs 内部兜：座位是 single 槽，抛错会被 DSH 的 SlotErrorBoundary
// 捕获并把条目放进 abdicated 集合（entriesOfSlot 跳过它），官方选择器接管 ——
// 结果就是「插件看似装了、却完全没有 UI」，且外部看不到任何报错。
// 我们自己先接住错误，就能在让位前把现场写进 localStorage（seat.js），便于定位。

import React from 'react';
import ModelTabs from './ModelTabs.js';
import { recordRenderError, abandonSeat } from './seat.js';

/**
 * 座位错误边界。
 * 捕获后渲染 null，并注销自身注册，让官方选择器立刻接替。
 */
class SeatBoundary extends React.Component {
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
}

/**
 * 注册到 `conversation.input.model` 的组件。
 * @param {object} props 槽注入的 props，原样透传给 ModelTabs
 * @returns {React.ReactElement}
 */
export default function ModelSeat(props) {
  return React.createElement(SeatBoundary, null, React.createElement(ModelTabs, props));
}
