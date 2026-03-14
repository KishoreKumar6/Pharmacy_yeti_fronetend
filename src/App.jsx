import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import Home from './pages/Home.jsx'
import NewCustomer from './pages/NewCustomer.jsx'
import ExistingCustomers from './pages/ExistingCustomers.jsx'
import EditCustomer from './pages/EditCustomer.jsx'
import TodaysRenewal from './pages/TodaysRenewal.jsx'
import PurchaseSummary from './pages/PurchaseSummary.jsx'
import { fetchCustomers, updateCustomer } from './services/Serivce.jsx'
import { getMedicationRows } from './utils/customer.js'

const menuItems = [
  { key: 'home', label: 'Home' },
  { key: 'new-customer', label: 'New Customer' },
  { key: 'existing-customers', label: 'Existing Customers' },
  { key: 'todays-renewal', label: 'Todays renewal' },
  { key: 'purchase-summary', label: 'Purchase summary' },
]

function App() {
  const [activePage, setActivePage] = useState('home')
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [toasts, setToasts] = useState([])
  const [editingCustomer, setEditingCustomer] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const loadCustomers = async (showErrorToast = false) => {
    setLoadingCustomers(true)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
    } catch {
      setCustomers([])
      if (showErrorToast) {
        showToast('Unable to load customers', 'error')
      }
    } finally {
      setLoadingCustomers(false)
    }
  }

  useEffect(() => {
    loadCustomers(false)
  }, [])

  const renewalRows = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return customers
      .flatMap((customer) =>
        getMedicationRows(customer).map((medRow, index) => {
          const rowRenewalDate = medRow?.renewalDate || customer?.renewalDate
          if (!rowRenewalDate) return null

          const renewalDate = new Date(rowRenewalDate)
          renewalDate.setHours(0, 0, 0, 0)
          const diffTime = renewalDate.getTime() - today.getTime()
          const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24))

          return {
            key: `${customer._id}-${index}`,
            customerId: customer._id,
            customerName: customer.personalDetail?.name || 'N/A',
            medicineName: medRow?.medicineName || 'N/A',
            type: medRow?.type || 'tablet',
            dosage: medRow?.dosage || 'full',
            frequency: Array.isArray(medRow?.frequency) ? medRow.frequency : [],
            frequencyCount: Array.isArray(medRow?.frequency) ? medRow.frequency.length : 0,
            status: medRow?.status || 'hold',
            rowIndex: index,
            days: medRow?.days ?? 'N/A',
            totalUnits: medRow?.totalUnits ?? 0,
            deliveryDate: medRow?.deliveryDate
              ? new Date(medRow.deliveryDate).toISOString().slice(0, 10)
              : '',
            renewalDate: renewalDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            renewalDateRaw: renewalDate,
            daysUntil,
          }
        })
      )
      .filter(Boolean)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [customers])

  const renewalGroups = useMemo(() => {
    const grouped = renewalRows.reduce((acc, row) => {
      const key = row.customerId
      if (!acc[key]) {
        acc[key] = {
          customerId: row.customerId,
          customerName: row.customerName,
          items: [],
          earliestDaysUntil: row.daysUntil,
        }
      }
      acc[key].items.push(row)
      acc[key].earliestDaysUntil = Math.min(acc[key].earliestDaysUntil, row.daysUntil)
      return acc
    }, {})

    return Object.values(grouped)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => a.daysUntil - b.daysUntil),
      }))
      .sort((a, b) => a.earliestDaysUntil - b.earliestDaysUntil)
  }, [renewalRows])

  const renewalSections = useMemo(() => {
    const sections = {
      overdue: [],
      dueSoon: [],
      dueLater: [],
    }

    renewalGroups.forEach((group) => {
      if (group.earliestDaysUntil < 0) {
        sections.overdue.push(group)
      } else if (group.earliestDaysUntil <= 2) {
        sections.dueSoon.push(group)
      } else {
        sections.dueLater.push(group)
      }
    })

    return sections
  }, [renewalGroups])

  const todaysRenewals = useMemo(
    () => renewalRows.filter((row) => row.daysUntil === 0),
    [renewalRows]
  )

  const purchaseSummary = useMemo(() => {
    const totals = {
      tablet: 0,
      syrup: 0,
      capsule: 0,
    }

    customers.forEach((customer) => {
      getMedicationRows(customer).forEach((row) => {
        const medType = row?.type
        const units = Number(row?.totalUnits || 0)

        if (totals[medType] !== undefined) {
          totals[medType] += units
        }
      })
    })

    return totals
  }, [customers])

  const totalUnits = useMemo(
    () => Object.values(purchaseSummary).reduce((acc, value) => acc + value, 0),
    [purchaseSummary]
  )

  const dueTodayCustomers = useMemo(() => {
    const ids = new Set(renewalRows.filter((row) => row.daysUntil === 0).map((row) => row.customerId))
    return ids.size
  }, [renewalRows])

  const overdueCustomers = useMemo(() => {
    const ids = new Set(renewalRows.filter((row) => row.daysUntil < 0).map((row) => row.customerId))
    return ids.size
  }, [renewalRows])

  const medicinesDueToday = useMemo(
    () => renewalRows.filter((row) => row.daysUntil === 0).length,
    [renewalRows]
  )

  const confirmedRows = useMemo(
    () =>
      renewalRows
        .filter((row) => row.status === 'confirm')
        .map((row) => ({
          ...row,
          finalUnits: Number(row.totalUnits || 0),
        })),
    [renewalRows]
  )

  const medicineSummary = useMemo(() => {
    const summary = confirmedRows.reduce((acc, row) => {
      const key = row.medicineName || 'N/A'
      if (!acc[key]) {
        acc[key] = {
          medicineName: key,
          totalUnits: 0,
          rows: [],
        }
      }
      acc[key].totalUnits += row.finalUnits
      acc[key].rows.push(row)
      return acc
    }, {})

    return Object.values(summary).sort((a, b) => a.medicineName.localeCompare(b.medicineName))
  }, [confirmedRows])

  const updateRenewalRow = async (customerId, rowIndex, updates, toastMessage) => {
    const customer = customers.find((item) => item._id === customerId)
    if (!customer) return

    const medicationDetails = getMedicationRows(customer).map((row, index) => {
      if (index !== rowIndex) return row
      return {
        ...row,
        ...updates,
      }
    })

    const payload = {
      personalDetail: customer.personalDetail,
      medicationDetails: medicationDetails.map((row) => ({
        medicineName: row.medicineName,
        type: row.type,
        frequency: row.frequency,
        dosage: row.dosage,
        status: row.status || 'hold',
        deliveryDate: row.deliveryDate || null,
        days: Number(row.days),
      })),
    }

    try {
      await updateCustomer(customerId, payload)
      await loadCustomers(false)
      if (toastMessage) {
        showToast(toastMessage, 'success')
      }
    } catch (error) {
      showToast(error.message || 'Failed to update renewal info', 'error')
    }
  }

  const overviewCards = [
    { title: 'Total Customers', value: customers.length },
    { title: 'Due Today (Customers)', value: dueTodayCustomers },
    { title: 'Overdue (Customers)', value: overdueCustomers },
    { title: 'Medicines Due Today', value: medicinesDueToday },
  ]

  const handleMenuClick = (item) => {
    setActivePage(item.key)
    showToast(`${item.label} page opened`, 'info')
  }

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setActivePage('edit-customer')
  }

  const handleEditBack = () => {
    setActivePage('existing-customers')
  }

  const handleCustomerCreated = async () => {
    await loadCustomers(false)
    setActivePage('existing-customers')
    showToast('Existing Customers page opened', 'info')
  }

  const renderPage = () => {
    if (activePage === 'new-customer') {
      return <NewCustomer onCustomerCreated={handleCustomerCreated} showToast={showToast} />
    }
    if (activePage === 'existing-customers') {
      return (
        <ExistingCustomers
          customers={customers}
          loadingCustomers={loadingCustomers}
          onRefresh={() => loadCustomers(true)}
          onEditCustomer={handleEditCustomer}
          showToast={showToast}
        />
      )
    }
    if (activePage === 'edit-customer') {
      return (
        <EditCustomer
          customer={editingCustomer}
          onCancel={handleEditBack}
          onUpdated={handleCustomerCreated}
          showToast={showToast}
        />
      )
    }
    if (activePage === 'todays-renewal') {
      return (
        <TodaysRenewal
          renewalSections={renewalSections}
          onActionChange={(row, action) =>
            updateRenewalRow(row.customerId, row.rowIndex, { status: action }, `${action} saved`)
          }
          onDaysChange={(row, days) => updateRenewalRow(row.customerId, row.rowIndex, { days })}
          onFrequencyChange={(row, frequency) =>
            updateRenewalRow(row.customerId, row.rowIndex, { frequency })
          }
        />
      )
    }
    if (activePage === 'purchase-summary') {
      return (
        <PurchaseSummary
          medicineSummary={medicineSummary}
          onDeliveryDateChange={(row, deliveryDate) => {
            const baseDate = deliveryDate ? new Date(deliveryDate) : null
            if (!baseDate) return
            const newRenewal = new Date(baseDate)
            newRenewal.setDate(newRenewal.getDate() + Number(row.days))
            updateRenewalRow(row.customerId, row.rowIndex, {
              deliveryDate: baseDate,
              renewalDate: newRenewal,
            })
          }}
        />
      )
    }
    return <Home overviewCards={overviewCards} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar menuItems={menuItems} activePage={activePage} onMenuClick={handleMenuClick} />

      <main className="flex min-h-screen flex-col lg:ml-72">
        <Topbar />
        {renderPage()}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
