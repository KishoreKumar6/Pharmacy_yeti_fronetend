import { useMemo, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { deleteCustomer } from '../services/Serivce.jsx'
import { formatDate, getMedicationRows } from '../utils/customer.js'

const ExistingCustomers = ({ customers, loadingCustomers, onRefresh, onEditCustomer, showToast }) => {
  const [confirmState, setConfirmState] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const handleDelete = async () => {
    if (!confirmState) return
    try {
      setBusyId(confirmState._id)
      await deleteCustomer(confirmState._id)
      showToast('Customer deleted successfully', 'success')
      await onRefresh()
    } catch (error) {
      showToast(error.message || 'Failed to delete customer', 'error')
    } finally {
      setBusyId(null)
      setConfirmState(null)
    }
  }

  const visibleMedicineLabel = (rows) => {
    if (!rows.length) return 'N/A'
    const firstThree = rows.slice(0, 3).map((row) => row.medicineName)
    return rows.length > 3 ? `${firstThree.join(', ')}...` : firstThree.join(', ')
  }

  const fullMedicineLabel = (rows) => rows.map((row) => row.medicineName).join(', ')

  const hoverList = useMemo(
    () =>
      customers.reduce((acc, customer) => {
        const rows = getMedicationRows(customer)
        acc[customer._id] = fullMedicineLabel(rows)
        return acc
      }, {}),
    [customers]
  )

  return (
    <section className="px-6 py-6">
      <h2 className="text-2xl font-bold text-slate-800">Existing Customers</h2>
      {loadingCustomers ? <p className="mt-3 text-sm text-slate-500">Loading customers...</p> : null}
      {!loadingCustomers && customers.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No customers found.</p>
      ) : null}

      {!loadingCustomers && customers.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Medicines</th>
                <th className="px-4 py-3 font-semibold">Total Units</th>
                <th className="px-4 py-3 font-semibold">Next Renewal</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const rows = getMedicationRows(customer)
                const rowUnits = rows.reduce((acc, row) => acc + Number(row.totalUnits || 0), 0)

                return (
                  <tr key={customer._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{customer.personalDetail?.name}</td>
                    <td className="px-4 py-3">{customer.personalDetail?.phoneNo}</td>
                    <td className="px-4 py-3">
                      <div className="group relative w-fit">
                        <span>{visibleMedicineLabel(rows)}</span>
                        {rows.length > 3 ? (
                          <div className="absolute left-0 top-full z-10 mt-2 hidden w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg group-hover:block">
                            {hoverList[customer._id]}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">{rowUnits}</td>
                    <td className="px-4 py-3">{formatDate(customer.renewalDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditCustomer(customer)}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmState(customer)}
                          disabled={busyId === customer._id}
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {confirmState ? (
        <ConfirmModal
          title="Delete customer"
          description="Are you sure you want to delete this customer? This action cannot be undone."
          confirmLabel="Delete"
          onCancel={() => setConfirmState(null)}
          onConfirm={handleDelete}
        />
      ) : null}

    </section>
  )
}

export default ExistingCustomers
