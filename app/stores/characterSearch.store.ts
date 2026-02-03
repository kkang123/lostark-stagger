import { create } from "zustand";

type CharacterSearchState = {
  input: string;
  submittedName: string;
  error: string | null;

  setInput: (v: string) => void;
  submit: () => void;
  clear: () => void;
};

export const useCharacterSearchStore = create<CharacterSearchState>(
  (set, get) => ({
    input: "",
    submittedName: "",
    error: null,

    setInput: (v) => set({ input: v, error: null }),

    submit: () => {
      const value = get().input.trim();

      // 2글자 미만
      if (value.length < 2) {
        set({ error: "캐릭터명을 두 글자 이상 입력해주세요." });
        return;
      }

      // 12글자 초과
      if (value.length > 12) {
        set({ error: "캐릭터명은 최대 12글자까지 입력할 수 있습니다." });
        return;
      }
      // ui에서도 막지만 여기서도 막아야하는 이유는 일부 환경(자동완성, 음성 입력, 붙여넣기는 뚫릴 수 있기 때문에)

      // ✅ 통과
      set({
        submittedName: value,
        error: null,
      });
    },

    clear: () => set({ input: "", submittedName: "", error: null }),
  }),
);
