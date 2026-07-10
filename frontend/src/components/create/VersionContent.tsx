import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../ui';
import type { ContentVersion, ScriptSection } from '../../api/contentCreationService';
import { CaptionCounter, HashtagCounter } from './platformLimits';

const sectionLabel = { fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#a59fbb', marginBottom: 8 } as const;
const block = { background: '#faf8fe', borderRadius: 12, padding: '12px 16px', fontSize: 13.5, lineHeight: 1.55, color: '#3f3a55' } as const;

export type VersionTab = 'script' | 'content' | 'media';

/** Thanh sub-tab dùng chung: Script video / Nội dung / Media prompt. */
export function VersionTabs({ value, onChange }: { value: VersionTab; onChange: (tab: VersionTab) => void }) {
  const { t } = useApp();
  const tabs: { key: VersionTab; label: string }[] = [
    { key: 'script', label: t.cwTabScript },
    { key: 'content', label: t.cwTabContent },
    { key: 'media', label: t.cwTabMedia },
  ];
  return (
    <div role="tablist" style={{ display: 'inline-flex', gap: 4, background: '#f6f3fc', borderRadius: 11, padding: 4 }}>
      {tabs.map(({ key, label }) => {
        const on = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(key)}
            style={{
              border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              background: on ? '#fff' : 'transparent', color: on ? '#7c3aed' : '#8a85a0',
              boxShadow: on ? '0 2px 8px -3px rgba(80,60,140,.25)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Một phần kịch bản (hook/bước/CTA): badge + timing, nội dung, và khối "Gợi ý cảnh quay" TÁCH RIÊNG. */
function ScriptSectionBlock({
  accent,
  badgeBg,
  badgeColor,
  badgeLabel,
  section,
}: {
  accent: string;
  badgeBg: string;
  badgeColor: string;
  badgeLabel: string;
  section: ScriptSection;
}) {
  const { t } = useApp();
  return (
    <div style={{ ...block, borderLeft: `3px solid ${accent}`, borderRadius: '0 12px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-block', background: badgeBg, color: badgeColor, borderRadius: 7, padding: '2px 8px', fontSize: 10.5, fontWeight: 700 }}>{badgeLabel}</span>
        {section.timing && (
          <span style={{ display: 'inline-block', background: '#fff', border: '1px solid #ece7f6', color: '#8a85a0', borderRadius: 7, padding: '1px 8px', fontSize: 10.5, fontWeight: 700 }}>⏱ {section.timing}</span>
        )}
      </div>
      <div style={{ whiteSpace: 'pre-line' }}>{section.content}</div>
      {section.sceneSuggestion && (
        <div style={{ background: '#fff', border: '1px dashed #e3dcf4', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, color: '#6b6680' }}>
          <span style={{ fontWeight: 700, color: '#8a85a0' }}>🎬 {t.cwScene}: </span>
          {section.sceneSuggestion}
        </div>
      )}
    </div>
  );
}

/** Tab Script video (read-only): hook có timing → các bước đánh số → CTA cuối có timing (FR-25). */
export function ScriptView({ version }: { version: ContentVersion }) {
  const { t } = useApp();
  const { hook, steps, cta } = version.script;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ScriptSectionBlock accent="#8b5cf6" badgeBg="#f3edff" badgeColor="#7c3aed" badgeLabel={t.cwHook} section={hook} />
      {steps.map((step) => (
        <ScriptSectionBlock
          key={step.index}
          accent="#22d3ee"
          badgeBg="#e0f7fb"
          badgeColor="#0e7490"
          badgeLabel={`${t.cwStepWord} ${step.index}`}
          section={{ ...step, timing: '' }}
        />
      ))}
      <ScriptSectionBlock accent="#ec4899" badgeBg="#fdeef5" badgeColor="#be185d" badgeLabel={t.cwEndCta} section={cta} />
    </div>
  );
}

/** Tab Nội dung (read-only): caption + hashtag + CTA gộp CÙNG tab, kèm bộ đếm giới hạn nền tảng. */
export function ContentFieldsView({ version }: { version: ContentVersion }) {
  const { t } = useApp();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={sectionLabel}>{t.cwTabCaption}</div>
        <div style={block}>{version.caption}</div>
        <CaptionCounter platform={version.platform} text={version.caption} />
      </div>
      <div>
        <div style={sectionLabel}>{t.cwTabHashtag}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {version.hashtags.map((h, i) => (
            <span key={i} style={{ background: '#f3edff', color: '#7c3aed', borderRadius: 8, padding: '5px 11px', fontSize: 12.5, fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        <HashtagCounter platform={version.platform} count={version.hashtags.length} />
      </div>
      <div>
        <div style={sectionLabel}>{t.cwTabCta}</div>
        <div style={block}>{version.cta}</div>
      </div>
    </div>
  );
}

/** Tab Media prompt (read-only) + nút copy nhanh (FR-29: chỉ là mô tả text, không sinh media). */
export function MediaPromptView({ version }: { version: ContentVersion }) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(version.mediaPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ ...sectionLabel, marginBottom: 0 }}>{t.cwTabMedia}</div>
        <button
          onClick={copy}
          className="btn-soft"
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #ece8f6', background: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 11.5, fontWeight: 700, color: copied ? '#16a34a' : '#574f6e', cursor: 'pointer' }}
        >
          <Icon icon={copied ? Check : Copy} size={13} stroke={copied ? '#16a34a' : '#574f6e'} />
          {copied ? t.cwCopied : t.cwCopy}
        </button>
      </div>
      <div style={{ ...block, border: '1.5px dashed #d9cef5', background: '#fdfcff', fontSize: 12.5, color: '#6b6680', whiteSpace: 'pre-line' }}>{version.mediaPrompt}</div>
    </div>
  );
}

/** Hiển thị read-only một ContentVersion theo 3 sub-tab: Script video / Nội dung / Media prompt. */
export default function VersionContent({ version }: { version: ContentVersion }) {
  const [tab, setTab] = useState<VersionTab>('script');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VersionTabs value={tab} onChange={setTab} />
      {tab === 'script' && <ScriptView version={version} />}
      {tab === 'content' && <ContentFieldsView version={version} />}
      {tab === 'media' && <MediaPromptView version={version} />}
    </div>
  );
}
