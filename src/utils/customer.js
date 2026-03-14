export const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const isSameDay = (dateA, dateB) =>
  dateA.getDate() === dateB.getDate() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getFullYear() === dateB.getFullYear()

export const getMedicationRows = (customer) => {
  if (Array.isArray(customer?.medicationDetails) && customer.medicationDetails.length > 0) {
    return customer.medicationDetails
  }

  if (customer?.medicationDetail) {
    return [customer.medicationDetail]
  }

  return []
}
