import { useMemo, useState } from 'react'

const MedicineRow = ({
  row,
  index,
  totalRows,
  medicines,
  onFieldChange,
  onFrequencyToggle,
  onRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const suggestions = useMemo(() => {
    const query = row.medicineName.trim().toLowerCase()
    if (!query) return []

    return medicines
      .filter((item) => item.normalizedName.includes(query))
      .slice(0, 10)
  }, [medicines, row.medicineName])

  const showSuggestions = isOpen && suggestions.length > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Medicine Row {index + 1}</h4>
        {totalRows > 1 ? (
          <button
            className="grid h-7 w-7 place-items-center rounded-lg bg-red-500 text-xs font-bold text-white"
            type="button"
            onClick={onRemove}
          >
            x
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <label className="relative flex flex-col gap-2 text-sm font-semibold text-slate-600">
          Medicine name
          <input
            required
            type="text"
            value={row.medicineName}
            onChange={(event) => onFieldChange('medicineName', event.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          />
          {showSuggestions ? (
            <ul className="absolute left-0 top-[72px] z-10 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {suggestions.map((item) => (
                <li key={item._id || item.name}>
                  <button
                    type="button"
                    onMouseDown={() => onFieldChange('medicineName', item.name)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
          Type
          <select
            value={row.type}
            onChange={(event) => onFieldChange('type', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="tablet">Tablet</option>
            <option value="syrup">Syrup</option>
            <option value="capsule">Capsule</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
          Dosage
          <select
            value={row.dosage}
            onChange={(event) => onFieldChange('dosage', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="full">Full</option>
            <option value="half">Half</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
          Days
          <input
            required
            min="1"
            type="number"
            value={row.days}
            onChange={(event) => onFieldChange('days', event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
          Total units
          <input
            readOnly
            type="text"
            value={row.totalUnits}
            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
          />
        </label>
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-slate-600">Frequency</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {['morning', 'afternoon', 'evening', 'night'].map((option) => (
            <label key={`${row.id}-${option}`} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={row.frequency.includes(option)}
                onChange={() => onFrequencyToggle(option)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
              />
              <span className="capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MedicineRow
