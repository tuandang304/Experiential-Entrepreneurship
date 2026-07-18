import type { ReactNode } from 'react';

/**
 * Presentation-only visual metadata cho nhà cung cấp AI — CHỈ để hiển thị (logo + màu nhấn),
 * KHÔNG quyết định provider nào tồn tại. Danh sách provider luôn lấy từ API (listAiProviders).
 * Provider có code KHÔNG nằm trong registry vẫn render bằng DEFAULT (không crash).
 *
 * Key theo `code` (ANTHROPIC/GOOGLE) — định danh ổn định, KHÔNG theo `id` (UUID đổi theo môi trường).
 * Backend hiện chỉ hỗ trợ ANTHROPIC + GOOGLE (enum AiProviderCode); các entry khác để sẵn cho
 * tương lai (NFR-09) — chỉ hiển thị NẾU API thật sự trả về code đó.
 */
export interface ProviderVisual {
  hue: string;
  logo: (size: number) => ReactNode;
}

// Anthropic sunburst — tính path 1 lần lúc load module.
const burstPath = (): string => {
  const cx = 12, cy = 12, R = 11, r = 2.6, arms = 12, w = 0.13;
  let d = '';
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2 - Math.PI / 2;
    const tx = cx + Math.cos(a) * R, ty = cy + Math.sin(a) * R;
    const b1x = cx + Math.cos(a - w) * r, b1y = cy + Math.sin(a - w) * r;
    const b2x = cx + Math.cos(a + w) * r, b2y = cy + Math.sin(a + w) * r;
    d += `M${b1x.toFixed(2)} ${b1y.toFixed(2)}L${tx.toFixed(2)} ${ty.toFixed(2)}L${b2x.toFixed(2)} ${b2y.toFixed(2)}Z`;
  }
  return d;
};
const BURST_D = burstPath();

const REGISTRY: Record<string, ProviderVisual> = {
  ANTHROPIC: {
    hue: '#8b5cf6',
    logo: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <circle cx="12" cy="12" r="2.3" />
        <path d={BURST_D} />
      </svg>
    ),
  },
  GOOGLE: {
    hue: '#4285f4',
    logo: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M12 1c.4 6 4 9.6 10 11-6 1.4-9.6 5-10 11-.4-6-4-9.6-10-11 6-1.4 9.6-5 10-11z" />
      </svg>
    ),
  },
  // ── Forward-looking (chỉ render nếu backend trả về code này) ──
  OPENAI: {
    hue: '#10a37f',
    logo: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M12 2.6 10.2 8a3 3 0 0 1-2.2 2.05L2.6 12l5.4 1.95A3 3 0 0 1 10.2 16L12 21.4 13.8 16a3 3 0 0 1 2.2-2.05L21.4 12l-5.4-1.95A3 3 0 0 1 13.8 8z" />
      </svg>
    ),
  },
  COHERE: {
    hue: '#ff6b5e',
    logo: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" aria-hidden>
        <path d="M8.5 14.5A5 5 0 1 1 15 8" />
      </svg>
    ),
  },
  HUGGINGFACE: {
    hue: '#f5a623',
    logo: (s) => (
      <span style={{ fontSize: Math.round(s * 0.9), lineHeight: 1 }} aria-hidden>🤗</span>
    ),
  },
};

/** Fallback khi code không có trong registry — glyph trung tính, màu tím thương hiệu. */
const DEFAULT: ProviderVisual = {
  hue: '#7c3aed',
  logo: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M9 9h6v6H9z" />
    </svg>
  ),
};

export function providerVisual(code: string): ProviderVisual {
  return REGISTRY[code] ?? DEFAULT;
}
