/**
 * SettingsPanel —— 「模型 Tab」设置页
 *
 * 注册进 `settings.section`（list 槽，root scope），在 DSH 设置里加一页：
 *   · 生效阈值：总模型数 / 单提供商模型数（超过才启用两级 Tab）
 *   · 族规则：编辑 `overrides` 数组（JSON），可覆盖内置规则、也可追加新族
 *
 * 配置读写一律走 `config.js`（loadConfig / saveConfig / validateConfig），
 * 本组件只负责输入、校验提示与提交，不自己碰 localStorage。
 *
 * 视觉约定：
 *   · 颜色只用 `--dsw-alias-*` 主题 token；半透明底用 color-mix 从 token 派生，
 *     并先写纯 token 兜底值（老宿主不认 color-mix 时不至于无底）。
 *   · 样式用 React 元素 `<style>` 随组件挂载/卸载，不碰 document.head。
 *   · 不用 emoji 当图标，用 primitives 的 Icon* 组件。
 */

import React from 'react';
import {
  IconWarningOutlineRegular,
  IconCheckOutlineRegular,
} from '@deepseek-ai/dsh-client-ui-primitives';
import {
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  subscribeConfig,
  validateConfig,
} from './config.js';

// ── 样式（前缀 mts- 与 ModelTabs 的 mt- 区分，避免类名互染）────────────────
const CSS = [
  // 容器：设置面板里的一页内容
  '.mts-root{display:flex;flex-direction:column;gap:14px;max-width:840px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px}',
  '.mts-head{display:flex;flex-direction:column;gap:3px}',
  '.mts-title{margin:0;font-size:15px;line-height:22px;font-weight:600}',
  '.mts-intro{margin:0;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-secondary)}',
  // 顶部提示条：先纯 token 兜底，再 color-mix 叠淡色底
  '.mts-banner{display:flex;align-items:flex-start;gap:8px;padding:8px 11px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);font-size:12.5px;line-height:18px}',
  '.mts-banner-error{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 9%,var(--dsw-alias-bg-layer-1))}',
  '.mts-banner-ok{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 9%,var(--dsw-alias-bg-layer-1))}',
  '.mts-banner-txt{flex:1;min-width:0;word-break:break-word}',
  '.mts-banner-icon{flex:none;margin-top:2px}',
  // 区块
  '.mts-block{display:flex;flex-direction:column;gap:8px;padding:12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}',
  '.mts-block-head{display:flex;flex-direction:column;gap:2px}',
  '.mts-block-title{margin:0;font-size:13px;line-height:20px;font-weight:600}',
  '.mts-hint{margin:0;font-size:11.5px;line-height:17px;color:var(--dsw-alias-label-secondary)}',
  // 阈值行
  '.mts-fields{display:flex;flex-wrap:wrap;gap:14px}',
  '.mts-field{display:flex;align-items:center;gap:8px}',
  '.mts-field-label{font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap}',
  '.mts-number{box-sizing:border-box;width:88px;height:28px;padding:0 8px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12.5px;line-height:18px;font-variant-numeric:tabular-nums;outline:none}',
  '.mts-number:focus-visible{border-color:var(--dsw-alias-brand-primary)}',
  // 规则编辑器
  '.mts-editor{box-sizing:border-box;width:100%;min-height:200px;resize:vertical;padding:9px 11px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:18px;tab-size:2;outline:none;white-space:pre}',
  '.mts-editor:focus-visible{border-color:var(--dsw-alias-brand-primary)}',
  // 按钮
  '.mts-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '.mts-spacer{flex:1}',
  '.mts-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 11px;box-sizing:border-box;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12.5px;line-height:18px;cursor:pointer;white-space:nowrap}',
  '.mts-btn:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-label-secondary) 10%,transparent)}',
  '.mts-btn:focus-visible{outline:none;border-color:var(--dsw-alias-brand-primary)}',
  '.mts-btn:disabled{opacity:.45;cursor:default}',
  '.mts-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}',
  '.mts-btn-primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary);opacity:.88}',
].join('');

/** 阈值合法区间（与 config.js 的校验口径一致）。 */
const THRESHOLD_MIN = 1;
const THRESHOLD_MAX = 1000;

/** 「填入模板」的示例内容：覆盖一条内置族 + 追加一条自定义族。 */
const OVERRIDES_TEMPLATE = JSON.stringify(
  [
    { key: 'deepseek', label: 'DeepSeek', prefixes: ['deepseek', 'ds'] },
    { key: 'my-family', label: 'My Family', prefixes: ['myfam', 'myfamily'] },
  ],
  null,
  2,
);

/**
 * 把配置里的 overrides 渲染成编辑用的 JSON 文本。
 * @param {object} config
 * @returns {string}
 */
function overridesTextOf(config) {
  const overrides = Array.isArray(config?.overrides) ? config.overrides : [];
  return JSON.stringify(overrides, null, 2);
}

/**
 * 解析用户输入的规则 JSON；必须是数组。
 * @param {string} text
 * @returns {{ok:true, value:any[]}|{ok:false, error:string}}
 */
function parseOverrides(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: (error && error.message) || 'JSON 解析失败' };
  }
  if (!Array.isArray(parsed)) return { ok: false, error: '规则必须是一个数组' };
  return { ok: true, value: parsed };
}

/**
 * 校验阈值输入：必须是 1..1000 的整数。
 * @param {string} raw 输入框原始值
 * @returns {{ok:true, value:number}|{ok:false, error:string}}
 */
function parseThreshold(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return { ok: false, error: '阈值不能为空' };
  if (!/^\d+$/.test(text)) return { ok: false, error: '阈值必须是正整数' };
  const value = Number(text);
  if (value < THRESHOLD_MIN || value > THRESHOLD_MAX) {
    return { ok: false, error: `阈值必须在 ${THRESHOLD_MIN}..${THRESHOLD_MAX} 之间` };
  }
  return { ok: true, value };
}

/**
 * 设置页组件。`t` 由 `settings.section` 注册时声明的 `locale: NS` 注入。
 * @param {{t?:Function}} props
 * @returns {React.ReactElement}
 */
export default function SettingsPanel(props) {
  const t = typeof props?.t === 'function' ? props.t : (key) => key;

  // 已保存的配置（「恢复默认」与「外部变更」以它为基准）
  const [saved, setSaved] = React.useState(() => loadConfig());
  // 编辑态
  const [totalModels, setTotalModels] = React.useState(() => String(saved.thresholds.totalModels));
  const [perProvider, setPerProvider] = React.useState(() => String(saved.thresholds.perProvider));
  const [rulesText, setRulesText] = React.useState(() => overridesTextOf(saved));
  const [banner, setBanner] = React.useState(null); // { tone:'ok'|'error', text }

  // 是否有未保存改动：外部配置变化时不覆盖用户正在编辑的内容
  const dirtyRef = React.useRef(false);
  const markDirty = () => {
    dirtyRef.current = true;
  };

  /**
   * 用一份配置重置编辑态（保存 / 恢复默认 / 外部变更后调用）。
   * @param {object} config
   */
  const adopt = React.useCallback((config) => {
    setSaved(config);
    setTotalModels(String(config.thresholds.totalModels));
    setPerProvider(String(config.thresholds.perProvider));
    setRulesText(overridesTextOf(config));
    dirtyRef.current = false;
  }, []);

  // 订阅配置变化：跨标签页 / 其他入口保存后，未编辑时同步刷新
  React.useEffect(
    () =>
      subscribeConfig((next) => {
        if (dirtyRef.current) return; // 不打断用户正在进行的编辑
        adopt(next);
      }),
    [adopt],
  );

  /** 保存：先本地校验阈值与 JSON，再交给 saveConfig（它会再做一次完整校验）。 */
  const save = () => {
    const total = parseThreshold(totalModels);
    if (!total.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: total.error }) });
      return;
    }
    const per = parseThreshold(perProvider);
    if (!per.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: per.error }) });
      return;
    }
    const rules = parseOverrides(rulesText);
    if (!rules.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: rules.error }) });
      return;
    }

    const next = {
      ...saved,
      thresholds: { totalModels: total.value, perProvider: per.value },
      overrides: rules.value,
    };
    const checked = validateConfig(next);
    if (!checked.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: checked.error }) });
      return;
    }

    const result = saveConfig(checked.value);
    if (!result.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: result.error }) });
      return;
    }
    adopt(checked.value);
    setBanner({ tone: 'ok', text: t('settings.saved') });
  };

  /** 恢复默认：把内置默认配置整体写回，并同步编辑态。 */
  const reset = () => {
    const next = {
      ...DEFAULT_CONFIG,
      thresholds: { ...DEFAULT_CONFIG.thresholds },
      overrides: [],
    };
    const checked = validateConfig(next);
    if (!checked.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: checked.error }) });
      return;
    }
    const result = saveConfig(checked.value);
    if (!result.ok) {
      setBanner({ tone: 'error', text: t('settings.invalid', { message: result.error }) });
      return;
    }
    adopt(checked.value);
    setBanner({ tone: 'ok', text: t('settings.saved') });
  };

  /** 填入模板：把示例规则写进编辑框（不落盘，等用户按保存）。 */
  const fillTemplate = () => {
    markDirty();
    setRulesText(OVERRIDES_TEMPLATE);
    setBanner(null);
  };

  const bannerEl =
    banner === null ? null : (
      <div
        className={`mts-banner ${banner.tone === 'error' ? 'mts-banner-error' : 'mts-banner-ok'}`}
        role={banner.tone === 'error' ? 'alert' : 'status'}
      >
        <span className="mts-banner-icon">
          {banner.tone === 'error' ? (
            <IconWarningOutlineRegular size={13} />
          ) : (
            <IconCheckOutlineRegular size={13} />
          )}
        </span>
        <span className="mts-banner-txt">{banner.text}</span>
      </div>
    );

  return (
    <section className="mts-root" aria-label={t('nav')}>
      <style>{CSS}</style>

      <div className="mts-head">
        <h2 className="mts-title">{t('nav')}</h2>
        <p className="mts-intro">{t('settings.intro')}</p>
      </div>

      {bannerEl}

      <div className="mts-block">
        <div className="mts-block-head">
          <h3 className="mts-block-title">{t('settings.thresholds')}</h3>
        </div>
        <div className="mts-fields">
          <label className="mts-field">
            <span className="mts-field-label">{t('settings.totalModels')}</span>
            <input
              className="mts-number"
              type="number"
              min={THRESHOLD_MIN}
              max={THRESHOLD_MAX}
              step={1}
              value={totalModels}
              onChange={(event) => {
                markDirty();
                setTotalModels(event.target.value);
              }}
            />
          </label>
          <label className="mts-field">
            <span className="mts-field-label">{t('settings.perProvider')}</span>
            <input
              className="mts-number"
              type="number"
              min={THRESHOLD_MIN}
              max={THRESHOLD_MAX}
              step={1}
              value={perProvider}
              onChange={(event) => {
                markDirty();
                setPerProvider(event.target.value);
              }}
            />
          </label>
        </div>
      </div>

      <div className="mts-block">
        <div className="mts-block-head">
          <h3 className="mts-block-title">{t('settings.rules')}</h3>
          <p className="mts-hint">{t('settings.rulesHint')}</p>
        </div>
        <textarea
          className="mts-editor"
          spellCheck={false}
          aria-label={t('settings.rules')}
          value={rulesText}
          onChange={(event) => {
            markDirty();
            setRulesText(event.target.value);
            setBanner(null);
          }}
        />
      </div>

      <div className="mts-actions">
        <button type="button" className="mts-btn" onClick={fillTemplate}>
          {t('settings.template')}
        </button>
        <button type="button" className="mts-btn" onClick={reset}>
          {t('settings.reset')}
        </button>
        <span className="mts-spacer" />
        <button type="button" className="mts-btn mts-btn-primary" onClick={save}>
          {t('settings.save')}
        </button>
      </div>
    </section>
  );
}
