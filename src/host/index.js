/**
 * dsh-model-tabs —— Host（Node 侧）半边
 *
 * 本插件是**纯客户端插件**：全部功能（模型座位 Tab、设置页、配置存取）都在浏览器
 * 半边 `lib/client.js` 里完成，配置存 localStorage，不经 Host。
 *
 * 这个文件存在的唯一理由是 bundle patch 需要一行可解析的 cordis 插件：
 * `cordis.patch.yml` 里 insert 的 `name: 'dsh-model-tabs'` 会被 loader 按
 * `package.json` 的 `main` 加载，缺少可解析的 main 会让整个 profile 加载失败。
 * 因此这里只导出空 `apply` 与空 `inject`，不注册任何 Host 服务。
 */

/**
 * cordis 插件入口：不注册任何服务，保持为空实现。
 * @param {object} ctx Host 根上下文（此处不使用）
 */
export function apply(ctx) {
  // 纯客户端插件，Host 侧无业务逻辑；保留参数签名以便调试时断点
  void ctx;
}

/** 本插件不依赖任何 Host 服务。 */
export const inject = [];
