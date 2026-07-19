import { useEffect, useState } from 'react';

export interface Breakpoint {
  width: number;
  isMobile: boolean; // < 760
  isTablet: boolean; // 760–1024
  isDesktop: boolean; // > 1024
}

/** Tracks viewport width and returns simple device buckets. */
export function useBreakpoint(): Breakpoint {
  const [width, setWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

  useEffect(() => {
    // Gộp các event resize liên tiếp về 1 lần cập nhật mỗi frame (rAF) — kéo giãn
    // cửa sổ không còn dội hàng chục lần re-render mỗi giây vào các trang nặng.
    let frame = 0;
    const onResize = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setWidth(window.innerWidth);
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return {
    width,
    isMobile: width < 760,
    isTablet: width >= 760 && width <= 1024,
    isDesktop: width > 1024,
  };
}
