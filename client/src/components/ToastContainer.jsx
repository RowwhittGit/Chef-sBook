import Toast from "./Toast"
import useToastStore from "../stores/toastStore"

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast key={toast.id} toast={{ ...toast, index }} onRemove={removeToast} />
      ))}
    </>
  )
}

export default ToastContainer
