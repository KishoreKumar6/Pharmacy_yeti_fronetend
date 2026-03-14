export const createMedicationRow = () => ({
  id: `${Date.now()}-${Math.random()}`,
  medicineName: '',
  type: 'tablet',
  frequency: [],
  dosage: 'full',
  status: 'hold',
  days: '',
  totalUnits: 0,
})

export const calculateTotalUnits = (row) => {
  const days = Number(row.days) || 0
  const freqCount = Array.isArray(row.frequency) ? row.frequency.length : 0
  const dosageMultiplier = row.dosage === 'half' ? 0.5 : 1

  return days * freqCount * dosageMultiplier
}
