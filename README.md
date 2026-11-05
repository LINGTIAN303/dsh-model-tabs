# dsh-model-tabs

> DeepSeek Harness 插件：给 composer 的模型选择器加**两级 Tab**（提供商 + 模型系列），
> 大目录时减少滚动翻找与视觉分散；模型系列规则可在设置页配置。

## 这个插件解决什么问题

DSH 官方模型选择器已经按提供商分组，但**只是一层平铺列表**：所有提供商的模型排在同一个可滚动区域里。
本机实测 7 个提供商 / 70 个模型（单提供商最多 33 个）——要找一个模型得滚过 7 个分组头、70 行。

本插件在模型列表上方加两层 Tab：

| 层级 | 分类键 | 作用 |
|---|---|---|
| 一级 Tab | `provider.id` | 先收敛到一个提供商 |
| 二级 Tab | 模型名前缀族（`deepseek-v4.1-flash` → `deepseek`） | 再收敛到该提供商下的一个系列 |

两级 Tab 都保留「全部」，默认停在「全部」，因此**不打字也能快速收敛**；搜索框仍然可用，且与 Tab 叠加过滤。

## 只在大目录时生效

按官方「超过 4 个模型才出现搜索框」的思路，本插件也只在目录够大时才启用 Tab：

| 阈值 | 默认值 | 含义 |
|---|---|---|
| `totalModels` | 20 | 模型总数超过即启用 |
| `perProvider` | 30 | 或单个提供商模型数超过即启用 |

小目录**完全保持官方平铺样式**（不出现 Tab 条），不做过度设计。两个阈值都在设置页可调。

## 与官方选择器的关系

- **接管的是 composer 输入框里的模型按钮**（`conversation.input.model` 槽）。
- **`/model` 斜杠命令不受影响**：它走 `commandUi` 的 `popupSelect`，由官方 `ui-commands` 自行渲染，第三方插件没有注入点。这是当前 DSH 的硬约束，不是本插件的取舍。
- 视觉基线逐项对齐官方 `ModelSelect.module.css`（尺寸、token、焦点环、菜单定位、吸顶分组头），换装后观感不跳变。

## 模型系列如何识别

```
归一化模型名：取最后一个 '/' 之后 → 去掉 ':' 后缀 → 小写
       ↓
最长前缀命中内置规则表（deepseek / glm / kimi / minimax / qwen / doubao / hy / ling / mimo / step / gpt / claude / gemini / llama / mistral / space）
       ↓ 未命中
取模型名的前导字母串（text-embedding-3-small → text）
       ↓ 仍未命中
归入「其他」
```

用「最长前缀」而非「首个 token」，是因为纯 token 切分会把同一家厂商拆开。本机实测对比：

| 策略 | opencsg(25) | antdigital(20) | workbuddy(16) | trae(33) |
|---|---|---|---|---|
| 纯首 token | 13 族（6 个单例） | 9 族 | 10 族 | 9 族 |
| 最长前缀 | **11 族** | **8 族** | **8 族** | **8 族** |

纯 token 的典型误伤：`Qwen/Qwen-Image-2512` 与 `qwen3.8-max` 会被拆成两族；
`hy4free`/`hy4std`/`hy3` 会被拆成三族。最长前缀把这三类都合并了。

## 安装

```bash
# 方式一：npm（预构建，免构建脚本授权）
dsh plugin --profile <你的 profile> add dsh-model-tabs

# 方式二：GitHub 源码
dsh plugin --profile <你的 profile> add github:LINGTIAN303/dsh-model-tabs

# 方式三：本地开发
dsh plugin --profile <你的 profile> add "link:<本插件目录绝对路径>"
```

或在 DSH 设置 → 插件 里安装。装完需重启 DSH。

## 使用

1. 打开对话，点输入框左下角的模型按钮
2. 选「模型」进入列表 → 顶部出现提供商 Tab（仅大目录时）
3. 点某个提供商 → 出现该提供商的系列 Tab
4. 两级都可点「全部」回到上一级全集
5. 键盘：`←`/`→` 在 Tab 间切换，`↑`/`↓` 移动模型高亮，`Enter` 选中，`Esc` 逐级返回

## 设置页

设置 → 「模型 Tab」：

- 两个生效阈值（总模型数 / 单提供商模型数）
- 族规则 JSON（`overrides` 数组）：覆盖内置规则或追加新族
  ```json
  [
    { "key": "deepseek", "label": "DeepSeek", "prefixes": ["deepseek", "ds"] },
    { "key": "my-family", "label": "我的系列", "prefixes": ["myfam"] }
  ]
  ```
- 「填入模板」「保存」「恢复默认」

规则按 `key` 合并：同 key 覆盖内置规则，新 key 追加。配置存 `localStorage['dsh-model-tabs.config']`。

## 与其它模型选择器插件的兼容

本插件用 `priority: -1000` 接管 `conversation.input.model` 槽（`single` 槽按 priority 升序取第一个渲染；
官方原生是 `0`）。因此：

| 插件 | 影响 |
|---|---|
| `@ayanehana/dsh-reasoning-effort` | 它的推理等级滑块 UI 不再上屏（它只装饰原生 entry，原生 entry 被遮蔽后不上屏）；其功能由本插件的「推理等级」面板覆盖 |
| `@txc2768651338/dsh-effort-slider` | 它靠扫描 DOM 里的「推理等级」菜单行来涂色/弹面板，找不到匹配行时静默无效果 |
| `dsh-client-ui-deepseek-model-label-1017` | 它的角标不再渲染：`conversation.input.model.label` 子槽的声明被原生 entry 独占，重复声明会抛错、渲染未声明的子槽会抛 `SlotOwnershipError` |

**同一时刻只能有一个插件接管该槽。** 若你更想保留某个插件，装它、卸本插件即可。

## 安全说明

- 纯客户端插件：**无 Host 服务、无 HTTP 接口、不读写任何文件**
- 配置只存浏览器 `localStorage`
- 不写全局 CSS 选择器（所有类名带 `mt-` / `mts-` 前缀，不碰官方 `section[role="group"]`），因此不会误伤 `/model` 弹窗
- 服务缺失时静默退让：`sessions` / `modelDirectories` 任一不可用就不注册模型座位，官方选择器照常上屏

## 兼容性

- DSH `0.2.1-rc.5`（本机实测）、`0.2.2-rc.1`（声明兼容）
- Node.js `>= 22.12`

> DSH 官方 README 明写 `THERE WILL BE COMPATIBILITY-BREAKING CHANGES`。
> 本插件复刻了原生选择器的交互行为，若官方大改 `conversation.input.model` 的契约（槽名、注入面、`single` 槽排序约定），需要跟进。

## 开发

```bash
npm run build     # 构建 lib/index.js + lib/client.js
npm run watch     # 监听源码变化持续重建
npm run check     # 族分类与配置回归（69 项）+ 产物契约自检（5 项）
npm run smoke     # 产物级集成 14 项 + 装配层 5 项 + 主组件真 DOM 22 项
npm test          # check + smoke 全链路（105 项断言）
```

源码结构：

| 文件 | 职责 |
|---|---|
| `src/host/index.js` | Host 半边（空实现，仅满足 bundle patch 需要可解析的 main） |
| `src/client/index.js` | 装配：注册两个槽、服务缺失时退让、`directoryFor` 兜底 |
| `src/client/ModelSeat.js` | 座位错误边界：渲染抛错时记录诊断并主动让位给官方选择器 |
| `src/client/ModelTabs.js` | 模型座位主组件（trigger + 菜单 + 两级底部 Tab + 过滤 + effort） |
| `src/client/SettingsPanel.js` | 设置页 |
| `src/client/family.js` | 族分类纯逻辑 |
| `src/client/config.js` | 配置读写/校验/合并/订阅 |
| `src/client/seat.js` | 座位守卫：诊断落盘（`localStorage['dsh-model-tabs.lastError']`）+ 让位 |
| `src/client/locale.js` | zh / en 字典 |
| `tools/build.mjs` | esbuild 打包 + `__ModuleLoader__.load` 包裹 |
| `tools/check-family.mjs` | 族分类与配置回归 |
| `tools/verify-build.mjs` | 产物契约自检（包裹格式 / external / BOM / ESM 导出） |
| `tools/smoke-bundle.mjs` | 用真实 React 加载最终产物，验槽注册与退避 |
| `tools/smoke-assembly.cjs` | 假 React stub 验装配契约 |
| `tools/smoke-modeltabs.mjs` | jsdom 真 DOM 渲染主组件，验两级 Tab / 过滤 / 选择 |

设计文档：[技术勘察](docs/plans/2026-11-05-模型选择器Tab增强-技术勘察.md) · [实施方案](docs/plans/2026-11-05-模型选择器Tab增强-实施方案.md)

> 实施方案的「不可达项」提到我们直接渲染模型名。真机验证阶段还发现并修复了
> 单槽退位（`scope.effect` 契约不符 / `directoryFor` 抛错导致静默失去 UI），
> 见提交历史中的守卫相关提交。

## 许可

MIT
