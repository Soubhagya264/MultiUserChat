import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GeneralState {
  isProfileSettingsModalOpen: boolean;
  isLoginPageOpen: boolean;
  isCreateRoomModalOpen: boolean;
  toggleProfileSettingsModal: () => void;
  toggleLoginPage: () => void;
  toggleCreateRoomModal: () => void;
}

export const useGeneralStore = create<GeneralState>()(
  persist(
    (set) => ({
      isProfileSettingsModalOpen: false,
      isLoginPageOpen: false,
      isCreateRoomModalOpen: false,

      toggleProfileSettingsModal: () =>
        set((state) => ({
          isProfileSettingsModalOpen: !state.isProfileSettingsModalOpen,
        })),
      toggleLoginPage: () =>
        set((state) => ({
          isLoginPageOpen: !state.isLoginPageOpen,
        })),
      toggleCreateRoomModal: () =>
        set((state) => ({
          isCreateRoomModalOpen: !state.isCreateRoomModalOpen,
        })),
    }),
    {
      name: "general-store",
    }
  )
);
