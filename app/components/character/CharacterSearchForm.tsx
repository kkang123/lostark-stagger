"use client";

import { useRouter } from "next/navigation";
import { useCharacterSearchStore } from "@/stores/characterSearch.store";

export default function CharacterSearchForm() {
  const router = useRouter();

  const input = useCharacterSearchStore((s) => s.input);
  const setInput = useCharacterSearchStore((s) => s.setInput);
  const submit = useCharacterSearchStore((s) => s.submit);
  const clear = useCharacterSearchStore((s) => s.clear);
  const error = useCharacterSearchStore((s) => s.error);

  const isValid = input.trim().length >= 2;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();

        // ✅ submit이 submittedName을 갱신하는 구조라면,
        // 이 타이밍에 아직 이전 값일 수 있어서 input을 기준으로 push하는 게 안전함
        const name = input.trim();
        router.push(`/char/${encodeURIComponent(name)}`);
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex gap-2">
        <div className="relative w-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=" "
            minLength={2}
            maxLength={12}
            className="peer h-12 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 pt-5 text-sm text-(--color-text-primary) outline-none
               placeholder:text-transparent focus:border-[#3182F6]/40 transition-colors"
          />
          <label
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-(--color-text-tertiary)
                   transition-all duration-150
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-(--color-text-tertiary)
                   peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#5B9AF8]
                   peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-(--color-text-secondary)"
          >
            캐릭터명
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="h-12 shrink-0 rounded-xl bg-[#3182F6] px-4 text-sm font-medium text-white hover:bg-[#2571E5] active:bg-[#1F63D4] disabled:opacity-40 disabled:hover:bg-[#3182F6] transition-colors"
        >
          검색
        </button>
        <button
          type="button"
          onClick={clear}
          className="h-12 shrink-0 rounded-xl border border-(--color-border) bg-transparent px-4 text-sm text-(--color-text-tertiary) hover:bg-(--color-surface-elevated) hover:text-(--color-text-secondary) transition-colors"
        >
          초기화
        </button>
      </div>

      <p className="text-xs text-(--color-text-tertiary)">
        * 검색은 서버에서 JWT로 호출되며, 브라우저로 토큰이 노출되지 않습니다.
      </p>

      {error && <p className="text-xs text-red-300">{error}</p>}
    </form>
  );
}
