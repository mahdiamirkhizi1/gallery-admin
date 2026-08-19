import { create } from "zustand";
export type ToastTone = "success" | "error" | "info";
export type ToastItem = {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
};
type ToastState = {
  items: ToastItem[];
  push: (item: Omit<ToastItem, "id">) => void;
  remove: (id: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
};
let sequence = 0;
export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (item) =>
    set((state) => ({
      items: [...state.items, { ...item, id: Date.now() + sequence++ }].slice(
        -4,
      ),
    })),
  remove: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  success: (title, message) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id: Date.now() + sequence++,
          tone: "success" as const,
          title,
          message,
        },
      ].slice(-4),
    })),
  error: (title, message) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: Date.now() + sequence++, tone: "error" as const, title, message },
      ].slice(-4),
    })),
}));
const notify = (tone: ToastTone, title: string, message?: string) =>
  useToastStore.getState().push({ tone, title, message });
export const toast = {
  success: (title: string, message?: string) =>
    notify("success", title, message),
  error: (title: string, message?: string) => notify("error", title, message),
  info: (title: string, message?: string) => notify("info", title, message),
};
