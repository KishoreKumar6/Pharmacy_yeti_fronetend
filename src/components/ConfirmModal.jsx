import Modal from './Modal.jsx'

const ConfirmModal = ({ title, description, confirmLabel = 'Confirm', onCancel, onConfirm }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="text-sm text-slate-600">{description}</p>
    <div className="mt-5 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
)

export default ConfirmModal
