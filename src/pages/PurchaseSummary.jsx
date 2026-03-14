const PurchaseSummary = ({ medicineSummary, onDeliveryDateChange }) => (
  <section className="px-6 py-6">
    <h2 className="text-2xl font-bold text-slate-800">Purchase summary</h2>
    <div className="mt-6">
      {medicineSummary.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No confirmed renewals yet.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {medicineSummary.map((group) => (
            <div
              key={group.medicineName}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-slate-800">
                  {group.medicineName}
                </h4>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Total Units: {group.totalUnits}
                </span>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-600">
                      <th className="px-3 py-2 font-semibold">Customer</th>
                      <th className="px-3 py-2 font-semibold">Units</th>
                      <th className="px-3 py-2 font-semibold">Delivery Date</th>
                      <th className="px-3 py-2 font-semibold">Renewal Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.key} className="border-t border-slate-100">
                        <td className="px-3 py-2">{row.customerName}</td>
                        <td className="px-3 py-2">{row.totalUnits}</td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={row.deliveryDate || ''}
                            onChange={(event) => onDeliveryDateChange(row, event.target.value)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-400"
                          />
                        </td>
                        <td className="px-3 py-2">{row.renewalDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default PurchaseSummary;
