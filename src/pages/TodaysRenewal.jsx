import { useState } from 'react'

const badgeStyles = {
  overdue: 'bg-red-100 text-red-700',
  today: 'bg-emerald-100 text-emerald-700',
  reminder: 'bg-amber-100 text-amber-700',
  upcoming: 'bg-slate-100 text-slate-600',
}

const getStatus = (daysUntil) => {
  if (daysUntil < 0) return { label: 'Overdue', tone: 'overdue' }
  if (daysUntil === 0) return { label: 'Due Today', tone: 'today' }
  if (daysUntil <= 2) return { label: `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, tone: 'reminder' }
  return { label: `In ${daysUntil} days`, tone: 'upcoming' }
}

const actionBadgeStyles = {
  hold: 'bg-amber-100 text-amber-700',
  confirm: 'bg-emerald-100 text-emerald-700',
  cancel: 'bg-red-100 text-red-700',
}

const TodaysRenewal = ({
  renewalSections,
  actionMap,
  onActionChange,
  extraUnitsMap,
  onExtraUnitChange,
}) => {
  const [openCustomerId, setOpenCustomerId] = useState(null)

  const toggleCustomer = (customerId) => {
    setOpenCustomerId((prev) => (prev === customerId ? null : customerId))
  }

  const renderSection = (title, groups, accent) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-500">{groups.length} customer(s)</span>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-slate-500">No customers in this category.</p>
      ) : null}

      {groups.map((group) => (
        <div key={group.customerId} className="rounded-2xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => toggleCustomer(group.customerId)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <p className="text-base font-semibold text-slate-800">{group.customerName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {group.items.length} medicine{group.items.length === 1 ? '' : 's'}
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {openCustomerId === group.customerId ? 'Hide' : 'View'}
            </span>
          </button>

          {openCustomerId === group.customerId ? (
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-600">
                      <th className="px-3 py-2 font-semibold">Medicine</th>
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Days</th>
                      <th className="px-3 py-2 font-semibold">Total Units</th>
                      <th className="px-3 py-2 font-semibold">Renewal Date</th>
                      <th className="px-3 py-2 font-semibold">Extra Units</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((row) => {
                      const status = getStatus(row.daysUntil)
                      const action = actionMap[row.key]
                      return (
                        <tr key={row.key} className="border-t border-slate-100">
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{row.medicineName}</span>
                              {action ? (
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-semibold ${actionBadgeStyles[action]}`}
                                >
                                  {action}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2 capitalize">{row.type}</td>
                          <td className="px-3 py-2">{row.days}</td>
                          <td className="px-3 py-2">{row.totalUnits}</td>
                          <td className="px-3 py-2">{row.renewalDate}</td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={extraUnitsMap[row.key] || ''}
                              onChange={(event) => onExtraUnitChange(row.key, event.target.value)}
                              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-400"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[status.tone]}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              {['hold', 'confirm', 'cancel'].map((option) => (
                                <button
                                  key={`${row.key}-${option}`}
                                  type="button"
                                  onClick={() => onActionChange(row.key, option)}
                                  className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
                                    action === option
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )

  return (
    <section className="px-6 py-6">
      <h2 className="text-2xl font-bold text-slate-800">Renewals & Reminders</h2>
      {renewalSections.overdue.length === 0 &&
      renewalSections.dueSoon.length === 0 &&
      renewalSections.dueLater.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No renewal records found.</p>
      ) : null}
      {renewalSections.overdue.length > 0 ||
      renewalSections.dueSoon.length > 0 ||
      renewalSections.dueLater.length > 0 ? (
        <div className="mt-4 flex flex-col gap-8">
          {renderSection('Overdue', renewalSections.overdue, 'bg-red-500')}
          {renderSection('Due Soon (0-2 days)', renewalSections.dueSoon, 'bg-amber-500')}
          {renderSection('Due Later (3+ days)', renewalSections.dueLater, 'bg-slate-400')}
        </div>
      ) : null}
    </section>
  )
}

export default TodaysRenewal
