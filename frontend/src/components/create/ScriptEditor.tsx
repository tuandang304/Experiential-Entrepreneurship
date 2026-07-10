import { Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui';
import type { ScriptSection, VideoScript } from '../../api/contentCreationService';

const inputBase = {
  width: '100%', border: '1.5px solid #e7e2f2', borderRadius: 12, padding: '11px 14px',
  fontSize: 13.5, lineHeight: 1.55, color: '#241f3a', background: '#fbfaff', outline: 'none',
} as const;
const sectionBox = (accent: string) =>
  ({ borderLeft: `3px solid ${accent}`, borderRadius: '0 12px 12px 0', background: '#faf8fe', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }) as const;
const partBadge = (bg: string, color: string) =>
  ({ display: 'inline-block', background: bg, color, borderRadius: 7, padding: '2px 8px', fontSize: 10.5, fontWeight: 700 }) as const;

/**
 * Editor kịch bản video có cấu trúc (FR-25): hook (timing) → các bước đánh số → CTA (timing),
 * mỗi phần nhập RIÊNG nội dung và gợi ý cảnh quay. Dùng ở mốc 3 wizard + sửa tại chỗ màn chi tiết.
 */
export default function ScriptEditor({ script, onChange }: { script: VideoScript; onChange: (s: VideoScript) => void }) {
  const { t } = useApp();

  const area = (value: string, set: (v: string) => void, minHeight = 52, placeholder?: string) => (
    <textarea value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} style={{ ...inputBase, resize: 'vertical', minHeight }} />
  );

  const sectionFields = (section: ScriptSection, patch: (p: Partial<ScriptSection>) => void, withTiming: boolean) => (
    <>
      {withTiming && (
        <input
          value={section.timing}
          onChange={(e) => patch({ timing: e.target.value })}
          placeholder={t.cwTimingPh}
          aria-label={t.cwTiming}
          style={{ ...inputBase, width: 110, padding: '7px 10px', fontSize: 12.5 }}
        />
      )}
      {area(section.content, (v) => patch({ content: v }), 52)}
      <div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8a85a0' }}>🎬 {t.cwScene}</span>
        {area(section.sceneSuggestion, (v) => patch({ sceneSuggestion: v }), 44)}
      </div>
    </>
  );

  const patchStep = (i: number, p: Partial<VideoScript['steps'][number]>) =>
    onChange({ ...script, steps: script.steps.map((s, j) => (j === i ? { ...s, ...p } : s)) });
  const removeStep = (i: number) =>
    onChange({ ...script, steps: script.steps.filter((_, j) => j !== i).map((s, j) => ({ ...s, index: j + 1 })) });
  const addStep = () =>
    onChange({ ...script, steps: [...script.steps, { index: script.steps.length + 1, content: '', sceneSuggestion: '' }] });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={sectionBox('#8b5cf6')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={partBadge('#f3edff', '#7c3aed')}>{t.cwHook}</span>
        </div>
        {sectionFields(script.hook, (p) => onChange({ ...script, hook: { ...script.hook, ...p } }), true)}
      </div>

      {script.steps.map((step, i) => (
        <div key={i} style={sectionBox('#22d3ee')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={partBadge('#e0f7fb', '#0e7490')}>{t.cwStepWord} {step.index}</span>
            <button
              onClick={() => removeStep(i)}
              aria-label={t.cwRemoveStep}
              title={t.cwRemoveStep}
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', color: '#b7b2c8', cursor: 'pointer', padding: 3 }}
            >
              <Icon icon={X} size={14} stroke="#b7b2c8" />
            </button>
          </div>
          {sectionFields({ ...step, timing: '' }, (p) => patchStep(i, p), false)}
        </div>
      ))}

      <button
        onClick={addStep}
        className="btn-soft"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1.5px dashed #d9cef5', background: '#fdfcff', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
      >
        <Icon icon={Plus} size={14} stroke="#7c3aed" />{t.cwAddStep}
      </button>

      <div style={sectionBox('#ec4899')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={partBadge('#fdeef5', '#be185d')}>{t.cwEndCta}</span>
        </div>
        {sectionFields(script.cta, (p) => onChange({ ...script, cta: { ...script.cta, ...p } }), true)}
      </div>
    </div>
  );
}
