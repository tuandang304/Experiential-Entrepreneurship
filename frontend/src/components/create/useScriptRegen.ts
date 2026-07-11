import { useCallback, useRef, useState } from 'react';
import { regeneratePart, applyScriptPatch, type VideoScript } from '../../api/contentCreationService';
import type { ApiError } from '../../api/apiClient';
import type { RegenKey, SectionKind } from './ScriptSections';
import { stepRegenKey } from './ScriptSections';

/**
 * Nối 3 nút "Tạo lại" của ScriptSections vào API tạo lại từng phần (async, poll).
 * - `regenerating` giữ khoá phần đang chạy → chỉ phần đó spinner/disabled, phần khác vẫn dùng được.
 * - Patch được merge vào script MỚI NHẤT (scriptRef) nên chỉnh sửa tay ở phần khác trong lúc chờ
 *   không bị mất; chỉ nhánh vừa tạo lại bị thay.
 * - Lỗi một phần: giữ nguyên dữ liệu cũ của phần đó, trả message gọn qua `error`.
 * Trả về undefined handlers khi thiếu itemId/versionId (nút sẽ bị ẩn ở ScriptSections).
 */
export function useScriptRegen(
  itemId: string | null | undefined,
  versionId: string | null | undefined,
  script: VideoScript,
  onScriptChange: (s: VideoScript) => void,
) {
  const scriptRef = useRef(script);
  scriptRef.current = script;
  const [regenerating, setRegenerating] = useState<RegenKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const run = useCallback(
    async (key: RegenKey, section: SectionKind, field: 'content' | 'scene', stepIndex?: number) => {
      if (!itemId || !versionId || busyRef.current) return;
      busyRef.current = true;
      setRegenerating(key);
      setError(null);
      try {
        const patch = await regeneratePart(itemId, versionId, section, field, stepIndex);
        onScriptChange(applyScriptPatch(scriptRef.current, patch));
      } catch (e) {
        setError((e as ApiError).message ?? 'error');
      } finally {
        busyRef.current = false;
        setRegenerating(null);
      }
    },
    [itemId, versionId, onScriptChange],
  );

  const enabled = !!itemId && !!versionId;
  return {
    regenerating,
    error,
    clearError: () => setError(null),
    onRegenerateSection: enabled ? (part: SectionKind) => run(`${part}:content`, part, 'content') : undefined,
    onRegenerateScene: enabled ? (part: SectionKind) => run(`${part}:scene`, part, 'scene') : undefined,
    onRegenerateStep: enabled ? (index: number) => run(stepRegenKey(index), 'body', 'content', index) : undefined,
  };
}
