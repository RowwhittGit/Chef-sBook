"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300) // Wait for animation
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.duration, toast.id, onRemove])

  const toastClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
  }

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }

  return createPortal(
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${
        toastClasses[toast.type]
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      style={{ marginTop: `${toast.index * 70}px` }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icons[toast.type]}</span>
        <span className="flex-1 text-sm">{toast.message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onRemove(toast.id), 300)
          }}
          className="ml-2 text-white hover:text-gray-200 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default Toast
