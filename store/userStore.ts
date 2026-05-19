import { create } from "zustand";

interface UserState {
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
}
export const useUserStore= create<UserState>((set) => ({
    isAdmin: false,
    setIsAdmin: (value) => set({ isAdmin: value })
}));