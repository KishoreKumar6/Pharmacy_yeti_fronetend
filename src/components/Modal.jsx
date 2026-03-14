const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <button
          className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600"
          type="button"
          onClick={onClose}
        >
          x
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  </div>
)

export default Modal
