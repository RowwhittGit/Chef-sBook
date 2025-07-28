import { create } from "zustand"

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto remove toast after duration
    setTimeout(() => {
      get().removeToast(id)
    }, duration)

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearAllToasts: () => {
    set({ toasts: [] })
  },

  // Convenience methods
  showSuccess: (message, duration) => get().addToast(message, "success", duration),
  showError: (message, duration) => get().addToast(message, "error", duration),
  showWarning: (message, duration) => get().addToast(message, "warning", duration),
  showInfo: (message, duration) => get().addToast(message, "info", duration),
}))

export default useToastStore
