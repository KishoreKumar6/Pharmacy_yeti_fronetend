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
import { fetchCustomers } from './services/Serivce.jsx'
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
  const [renewalActionMap, setRenewalActionMap] = useState({})
  const [extraUnitsMap, setExtraUnitsMap] = useState({})

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
            days: medRow?.days ?? 'N/A',
            totalUnits: medRow?.totalUnits ?? 0,
            renewalDate: renewalDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
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

  const confirmedRows = useMemo(
    () =>
      renewalRows
        .filter((row) => renewalActionMap[row.key] === 'confirm')
        .map((row) => ({
          ...row,
          extraUnits: extraUnitsMap[row.key] || '',
          extraUnitsValue: Number(extraUnitsMap[row.key]) || 0,
          finalUnits: Number(row.totalUnits || 0) + (Number(extraUnitsMap[row.key]) || 0),
        })),
    [renewalRows, renewalActionMap, extraUnitsMap]
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

  const overviewCards = [
    { title: 'Total Customers', value: customers.length },
    { title: 'Todays Renewal', value: todaysRenewals.length },
    { title: 'Total Units', value: totalUnits },
    {
      title: 'Last Added',
      value: customers[0]?.personalDetail?.name || 'N/A',
    },
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
          actionMap={renewalActionMap}
          onActionChange={(rowKey, action) =>
            setRenewalActionMap((prev) => ({
              ...prev,
              [rowKey]: action,
            }))
          }
          extraUnitsMap={extraUnitsMap}
          onExtraUnitChange={(rowKey, value) =>
            setExtraUnitsMap((prev) => ({
              ...prev,
              [rowKey]: value,
            }))
          }
        />
      )
    }
    if (activePage === 'purchase-summary') {
      return (
        <PurchaseSummary
          totalUnits={totalUnits}
          purchaseSummary={purchaseSummary}
          confirmedRows={confirmedRows}
          medicineSummary={medicineSummary}
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
