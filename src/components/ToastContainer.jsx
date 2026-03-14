const toastStyles = {
  info: 'bg-blue-600',
  success: 'bg-emerald-600',
  error: 'bg-red-600',
}

const ToastContainer = ({ toasts }) => (
  <div className="fixed right-4 top-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`min-w-[240px] max-w-[360px] rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-lg ${
          toastStyles[toast.type] || toastStyles.info
        }`}
      >
        {toast.message}
      </div>
    ))}
  </div>
)

export default ToastContainer
