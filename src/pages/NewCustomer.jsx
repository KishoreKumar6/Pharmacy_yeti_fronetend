import { useEffect, useState } from 'react'
import MedicineRow from '../components/MedicineRow.jsx'
import PersonalDetailsForm from '../components/PersonalDetailsForm.jsx'
import { registerCustomer, fetchMedicines } from '../services/Serivce.jsx'
import { calculateTotalUnits, createMedicationRow } from '../utils/medication.js'

const initialForm = {
  personalDetail: {
    name: '',
    age: '',
    gender: 'male',
    phoneNo: '',
    address: '',
  },
  medicationDetails: [createMedicationRow()],
}

const NewCustomer = ({ onCustomerCreated, showToast }) => {
  const [formData, setFormData] = useState(initialForm)
  const [submitState, setSubmitState] = useState({ loading: false })
  const [medicines, setMedicines] = useState([])
  const [loadingMedicines, setLoadingMedicines] = useState(false)

  useEffect(() => {
    const loadMedicines = async () => {
      setLoadingMedicines(true)
      try {
        const data = await fetchMedicines()
        const normalized = data
          .map((item) => ({
            _id: item._id,
            name: item.name,
            normalizedName: item.normalizedName || item.name?.toLowerCase(),
          }))
          .filter((item) => item.name)
        setMedicines(normalized)
      } catch {
        setMedicines([])
        showToast('Unable to load medicines list', 'error')
      } finally {
        setLoadingMedicines(false)
      }
    }

    loadMedicines()
  }, [showToast])

  const onPersonalChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personalDetail: {
        ...prev.personalDetail,
        [field]: value,
      },
    }))
  }

  const onMedicationFieldChange = (rowId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicationDetails: prev.medicationDetails.map((row) => {
        if (row.id !== rowId) return row

        const updated = {
          ...row,
          [field]: value,
        }

        return {
          ...updated,
          totalUnits: calculateTotalUnits(updated),
        }
      }),
    }))
  }

  const onFrequencyToggle = (rowId, value) => {
    setFormData((prev) => ({
      ...prev,
      medicationDetails: prev.medicationDetails.map((row) => {
        if (row.id !== rowId) return row

        const exists = row.frequency.includes(value)
        const nextFrequency = exists
          ? row.frequency.filter((item) => item !== value)
          : [...row.frequency, value]

        const updated = {
          ...row,
          frequency: nextFrequency,
        }

        return {
          ...updated,
          totalUnits: calculateTotalUnits(updated),
        }
      }),
    }))
  }

  const addMedicationRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicationDetails: [...prev.medicationDetails, createMedicationRow()],
    }))
    showToast('New medicine row added', 'success')
  }

  const removeMedicationRow = (rowId) => {
    setFormData((prev) => {
      if (prev.medicationDetails.length === 1) {
        return prev
      }

      return {
        ...prev,
        medicationDetails: prev.medicationDetails.filter((row) => row.id !== rowId),
      }
    })
    showToast('Medicine row removed', 'info')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const hasInvalidFrequency = formData.medicationDetails.some((row) => row.frequency.length === 0)
    if (hasInvalidFrequency) {
      showToast('Select at least one frequency in each medicine row', 'error')
      return
    }

    const hasInvalidMedicine = formData.medicationDetails.some(
      (row) => !row.medicineName.trim() || Number(row.days) <= 0
    )

    if (hasInvalidMedicine) {
      showToast('Medicine name and days are required in all rows', 'error')
      return
    }

    const payload = {
      personalDetail: {
        ...formData.personalDetail,
        age: Number(formData.personalDetail.age),
      },
      medicationDetails: formData.medicationDetails.map((row) => ({
        medicineName: row.medicineName,
        type: row.type,
        frequency: row.frequency,
        dosage: row.dosage,
        days: Number(row.days),
      })),
    }

    try {
      setSubmitState({ loading: true })
      const response = await registerCustomer(payload)

      showToast(response.message || 'Customer registered successfully', 'success')
      setFormData(initialForm)

      await onCustomerCreated()
    } catch (error) {
      showToast(error.message || 'Failed to register customer', 'error')
    } finally {
      setSubmitState({ loading: false })
    }
  }

  return (
    <section className="px-6 py-6">
      <h2 className="text-2xl font-bold text-slate-800">New Customer Registration</h2>

      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <PersonalDetailsForm personalDetail={formData.personalDetail} onPersonalChange={onPersonalChange} />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-800">Medication detail</h3>
          </div>

          {loadingMedicines ? (
            <p className="mt-3 text-sm text-slate-500">Loading medicines list...</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-4">
            {formData.medicationDetails.map((row, index) => (
              <MedicineRow
                key={row.id}
                row={row}
                index={index}
                totalRows={formData.medicationDetails.length}
                medicines={medicines}
                onFieldChange={(field, value) => onMedicationFieldChange(row.id, field, value)}
                onFrequencyToggle={(value) => onFrequencyToggle(row.id, value)}
                onRemove={() => removeMedicationRow(row.id)}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              type="button"
              onClick={addMedicationRow}
            >
              Add Medicine
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            disabled={submitState.loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitState.loading ? 'Saving...' : 'Register Customer'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default NewCustomer
