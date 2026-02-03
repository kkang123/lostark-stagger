"use client";

import { useCharacterSearchStore } from "@/stores/characterSearch.store";

export default function CharacterSearchForm() {
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
            className="peer h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pt-5 text-sm outline-none
               placeholder:text-transparent focus:border-white/20"
          />
          <label
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400
                   transition-all duration-150
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400
                   peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-zinc-300
                   peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-zinc-300"
          >
            캐릭터명
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="h-12 shrink-0 rounded-xl bg-white/10 px-4 text-sm font-medium hover:bg-white/15 active:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10"
        >
          검색
        </button>
        <button
          type="button"
          onClick={clear}
          className="h-12 shrink-0 rounded-xl border border-white/10 bg-transparent px-4 text-sm hover:bg-white/5"
        >
          초기화
        </button>
      </div>

      <p className="text-xs text-zinc-400">
        * 검색은 서버에서 JWT로 호출되며, 브라우저로 토큰이 노출되지 않습니다.
      </p>

      {error && <p className="text-xs text-red-300">{error}</p>}
    </form>
  );
}
