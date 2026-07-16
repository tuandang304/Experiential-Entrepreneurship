import type { CSSProperties } from 'react';
import { FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { PlatformTag } from '../ui.tsx';
import { PLATFORM_BG } from '../../theme.ts';
import { TONE_COLORS } from '../../statusTokens.ts';
import { PLATFORM_TO_TAG } from '../../api/connections.ts';
import type { FailedPost } from '../../api/failedPosts.ts';
import { fmtDate, fmtTime, toneOf, typeLabel } from './shared.ts';

// Một bài lỗi trong danh sách master: variant 'row' (hàng bảng desktop/tablet) hoặc
// 'card' (thẻ dọc trên mobile). Viền trái theo loại lỗi (đỏ = vi phạm CS, cam = kỹ thuật);
// hàng đang chọn highlight nền tím nhạt. Hàng focus được (tabIndex) để modal chi tiết
// trả focus về đúng dòng vừa bấm khi đóng.

const tdStyle: CSSProperties = { padding: '12px 16px', fontSize: 13, color: '#4b4660', verticalAlign: 'top' };

/** Thumbnail placeholder — MVP không sinh ảnh (FR-29) nên dùng ô icon trung tính. */
function Thumb() {
  return (
    <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 9, background: '#f4f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden>
      <FileText size={17} color="#a78bfa" strokeWidth={1.8} />
    </span>
  );
}

function TypeBadges({ post }: { post: FailedPost }) {
  const { t } = useApp();
  const tone = toneOf(post);
  const failed = TONE_COLORS.danger;
  return (
    <span style={{ display: 'inline-flex', gap: 5, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 999, color: failed.color, background: failed.bg, whiteSpace: 'nowrap' }}>
        {t.fpStatusFailed}
      </span>
      <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 999, color: tone.color, background: tone.bg, whiteSpace: 'nowrap' }}>
        {typeLabel(post, t)}
      </span>
    </span>
  );
}

function CodeBadge({ code }: { code: string | null }) {
  if (!code) return <span style={{ color: '#a59fbb' }}>—</span>;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: '#6b6680', background: '#f3f0fa', borderRadius: 6, padding: '3px 8px' }}>
      #{code}
    </span>
  );
}

export default function FailedPostRow({
  post,
  selected,
  onSelect,
  variant,
}: {
  post: FailedPost;
  selected: boolean;
  onSelect: () => void;
  variant: 'row' | 'card';
}) {
  const { t } = useApp();
  const tag = PLATFORM_TO_TAG[post.platformName] ?? post.platformName.slice(0, 2);
  const caption = post.caption || t.fpNoCaption;
  const tone = toneOf(post);

  if (variant === 'card') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
        className="row-hover"
        style={{
          border: `1px solid ${selected ? '#c4b5fd' : '#efeaf8'}`, borderLeft: `3px solid ${tone.color}`,
          borderRadius: 14, padding: 13,
          background: selected ? '#f7f3ff' : '#fff', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: 9,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Thumb />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2b2543', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caption}</div>
            <div style={{ fontSize: 11, color: '#a59fbb', marginTop: 3 }}>{t.fpTypePost} · {post.accountName ?? '—'}</div>
          </div>
          <PlatformTag tag={tag} bg={PLATFORM_BG[tag] ?? '#6b7280'} size={26} radius={8} />
        </div>
        <div style={{ fontSize: 12, color: '#6b6680', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.errorMessage ?? '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <TypeBadges post={post} />
          <CodeBadge code={post.errorCode} />
          <span style={{ fontSize: 11, color: '#a59fbb', marginLeft: 'auto' }}>{fmtDate(post.failedAt)} {fmtTime(post.failedAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <tr
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      className="row-hover"
      style={{
        borderTop: '1px solid #f1eef8', cursor: 'pointer',
        background: selected ? '#f7f3ff' : undefined,
        boxShadow: `inset 3px 0 0 ${tone.color}`,
      }}
    >
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
          <Thumb />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2b2543', maxWidth: 210, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caption}</div>
            <div style={{ fontSize: 11, color: '#a59fbb', marginTop: 2 }}>{t.fpTypePost} · {post.accountName ?? '—'}</div>
          </div>
        </div>
      </td>
      <td style={tdStyle}>
        <PlatformTag tag={tag} bg={PLATFORM_BG[tag] ?? '#6b7280'} size={26} radius={8} />
      </td>
      <td style={tdStyle}>
        <div style={{ maxWidth: 220, fontSize: 12, lineHeight: 1.5, color: '#6b6680', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.errorMessage ?? '—'}
        </div>
      </td>
      <td style={tdStyle}><CodeBadge code={post.errorCode} /></td>
      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#4b4660' }}>{fmtDate(post.failedAt)}</div>
        <div style={{ fontSize: 11, color: '#a59fbb', marginTop: 2 }}>{fmtTime(post.failedAt)}</div>
      </td>
      <td style={tdStyle}><TypeBadges post={post} /></td>
    </tr>
  );
}
