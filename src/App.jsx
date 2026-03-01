import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { fetchCustomers, registerCustomer } from './services/Serivce.jsx'

const menuItems = [
  { key: 'home', label: 'Home' },
  { key: 'new-customer', label: 'New Customer' },
  { key: 'existing-customers', label: 'Existing Customers' },
  { key: 'todays-renewal', label: 'Todays renewal' },
  { key: 'purchase-summary', label: 'Purchase summary' },
]

const frequencyOptions = ['morning', 'afternoon', 'evening', 'night']

const createMedicationRow = () => ({
  id: `${Date.now()}-${Math.random()}`,
  medicineName: '',
  type: 'tablet',
  frequency: [],
  dosage: 'full',
  days: '',
  totalUnits: 0,
})

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

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const isSameDay = (dateA, dateB) =>
  dateA.getDate() === dateB.getDate() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getFullYear() === dateB.getFullYear()

const getMedicationRows = (customer) => {
  if (Array.isArray(customer?.medicationDetails) && customer.medicationDetails.length > 0) {
    return customer.medicationDetails
  }

  if (customer?.medicationDetail) {
    return [customer.medicationDetail]
  }

  return []
}

const calculateTotalUnits = (row) => {
  const days = Number(row.days) || 0
  const freqCount = Array.isArray(row.frequency) ? row.frequency.length : 0
  const dosageMultiplier = row.dosage === 'half' ? 0.5 : 1

  return days * freqCount * dosageMultiplier
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [formData, setFormData] = useState(initialForm)
  const [submitState, setSubmitState] = useState({ loading: false })
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

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

  const todaysRenewals = useMemo(() => {
    const today = new Date()
    const rows = []

    customers.forEach((customer) => {
      getMedicationRows(customer).forEach((medRow) => {
        const rowRenewalDate = medRow?.renewalDate || customer?.renewalDate
        if (!rowRenewalDate) return

        if (isSameDay(new Date(rowRenewalDate), today)) {
          rows.push({ customer, medRow })
        }
      })
    })

    return rows
  }, [customers])

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
      setFormData({
        personalDetail: {
          name: '',
          age: '',
          gender: 'male',
          phoneNo: '',
          address: '',
        },
        medicationDetails: [createMedicationRow()],
      })

      await loadCustomers(false)
      setActivePage('existing-customers')
      showToast('Existing Customers page opened', 'info')
    } catch (error) {
      showToast(error.message || 'Failed to register customer', 'error')
    } finally {
      setSubmitState({ loading: false })
    }
  }

  const overviewCards = [
    { title: 'Total Customers', value: customers.length },
    { title: 'Todays Renewal', value: todaysRenewals.length },
    { title: 'Total Units', value: totalUnits },
    {
      title: 'Last Added',
      value: customers[0]?.personalDetail?.name || 'N/A',
    },
  ]

  const renderHome = () => (
    <>
      <section className="page-head">
        <h2>Dashboard Overview</h2>
        <p>Manage your medical store customers, renewals and purchase records.</p>
      </section>

      <section className="stats-grid">
        {overviewCards.map((card) => (
          <article key={card.title} className="stat-card">
            <p className="stat-title">{card.title}</p>
            <p className="stat-value">{card.value}</p>
          </article>
        ))}
      </section>
    </>
  )

  const renderNewCustomer = () => (
    <section className="page-section">
      <h2 className="section-title">New Customer Registration</h2>

      <form className="customer-row-layout" onSubmit={handleSubmit}>
        <div className="form-card">
          <h3>Personal detail</h3>

          <label>
            Name
            <input
              required
              type="text"
              value={formData.personalDetail.name}
              onChange={(event) => onPersonalChange('name', event.target.value)}
            />
          </label>

          <div className="inline-two">
            <label>
              Age
              <input
                required
                min="1"
                type="number"
                value={formData.personalDetail.age}
                onChange={(event) => onPersonalChange('age', event.target.value)}
              />
            </label>

            <label>
              Gender
              <select
                value={formData.personalDetail.gender}
                onChange={(event) => onPersonalChange('gender', event.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <label>
            PhoneNo
            <input
              required
              type="text"
              value={formData.personalDetail.phoneNo}
              onChange={(event) => onPersonalChange('phoneNo', event.target.value)}
            />
          </label>

          <label>
            Address
            <textarea
              required
              rows="3"
              value={formData.personalDetail.address}
              onChange={(event) => onPersonalChange('address', event.target.value)}
            />
          </label>
        </div>

        <div className="form-card">
          <div className="card-head">
            <h3>Medication detail</h3>
            <button className="small-btn" type="button" onClick={addMedicationRow}>
              Add Medicine
            </button>
          </div>

          <div className="medicine-rows-wrap">
            {formData.medicationDetails.map((row, index) => (
              <div key={row.id} className="medicine-row">
                <div className="medicine-row-head">
                  <h4>Medicine Row {index + 1}</h4>
                  {formData.medicationDetails.length > 1 ? (
                    <button
                      className="delete-row-btn"
                      type="button"
                      onClick={() => removeMedicationRow(row.id)}
                    >
                      x
                    </button>
                  ) : null}
                </div>

                <div className="medicine-grid">
                  <label>
                    Medicine name
                    <input
                      required
                      type="text"
                      value={row.medicineName}
                      onChange={(event) =>
                        onMedicationFieldChange(row.id, 'medicineName', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Type
                    <select
                      value={row.type}
                      onChange={(event) => onMedicationFieldChange(row.id, 'type', event.target.value)}
                    >
                      <option value="tablet">Tablet</option>
                      <option value="syrup">Syrup</option>
                      <option value="capsule">Capsule</option>
                    </select>
                  </label>

                  <label>
                    Dosage
                    <select
                      value={row.dosage}
                      onChange={(event) => onMedicationFieldChange(row.id, 'dosage', event.target.value)}
                    >
                      <option value="full">Full</option>
                      <option value="half">Half</option>
                    </select>
                  </label>

                  <label>
                    Days
                    <input
                      required
                      min="1"
                      type="number"
                      value={row.days}
                      onChange={(event) => onMedicationFieldChange(row.id, 'days', event.target.value)}
                    />
                  </label>

                  <label>
                    Total number of units
                    <input readOnly type="text" value={row.totalUnits} />
                  </label>
                </div>

                <div className="checkbox-group">
                  <p>Frequency</p>
                  <div className="checkbox-options">
                    {frequencyOptions.map((option) => (
                      <label key={`${row.id}-${option}`} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={row.frequency.includes(option)}
                          onChange={() => onFrequencyToggle(row.id, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitState.loading}>
            {submitState.loading ? 'Saving...' : 'Register Customer'}
          </button>
        </div>
      </form>
    </section>
  )

  const renderExistingCustomers = () => (
    <section className="page-section">
      <h2 className="section-title">Existing Customers</h2>
      {loadingCustomers ? <p>Loading customers...</p> : null}
      {!loadingCustomers && customers.length === 0 ? <p>No customers found.</p> : null}

      {!loadingCustomers && customers.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Medicines</th>
                <th>Total Units</th>
                <th>Next Renewal</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const rows = getMedicationRows(customer)
                const medicineNames = rows.map((row) => row.medicineName).join(', ')
                const rowUnits = rows.reduce((acc, row) => acc + Number(row.totalUnits || 0), 0)

                return (
                  <tr key={customer._id}>
                    <td>{customer.personalDetail?.name}</td>
                    <td>{customer.personalDetail?.phoneNo}</td>
                    <td>{medicineNames || 'N/A'}</td>
                    <td>{rowUnits}</td>
                    <td>{formatDate(customer.renewalDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )

  const renderTodaysRenewal = () => (
    <section className="page-section">
      <h2 className="section-title">Todays renewal</h2>
      {todaysRenewals.length === 0 ? <p>No renewals due today.</p> : null}
      {todaysRenewals.length > 0 ? (
        <ul className="renewal-list">
          {todaysRenewals.map(({ customer, medRow }, index) => (
            <li key={`${customer._id}-${index}`}>
              <strong>{customer.personalDetail?.name}</strong> - {medRow?.medicineName} ({medRow?.totalUnits} units)
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )

  const renderPurchaseSummary = () => (
    <section className="page-section">
      <h2 className="section-title">Purchase summary</h2>
      <div className="summary-grid">
        <article className="summary-card">
          <p>Total units</p>
          <h3>{totalUnits}</h3>
        </article>
        <article className="summary-card">
          <p>Tablet units</p>
          <h3>{purchaseSummary.tablet}</h3>
        </article>
        <article className="summary-card">
          <p>Syrup units</p>
          <h3>{purchaseSummary.syrup}</h3>
        </article>
        <article className="summary-card">
          <p>Capsule units</p>
          <h3>{purchaseSummary.capsule}</h3>
        </article>
      </div>
    </section>
  )

  const renderPage = () => {
    if (activePage === 'new-customer') return renderNewCustomer()
    if (activePage === 'existing-customers') return renderExistingCustomers()
    if (activePage === 'todays-renewal') return renderTodaysRenewal()
    if (activePage === 'purchase-summary') return renderPurchaseSummary()
    return renderHome()
  }

  const handleMenuClick = (item) => {
    setActivePage(item.key)
    showToast(`${item.label} page opened`, 'info')
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon">K</div>
          <div>
            <h1 className="brand-title">Kumaran Medical</h1>
            <p className="brand-subtitle">and General Stores</p>
          </div>
        </div>

        <nav className="menu-list" aria-label="Sidebar menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`menu-item ${activePage === item.key ? 'active' : ''}`}
              type="button"
              onClick={() => handleMenuClick(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="profile-card">
          <div className="avatar">KM</div>
          <div>
            <p className="profile-name">Kumaran Medical</p>
            <p className="profile-role">Administrator</p>
          </div>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search customers, medicines or invoices..."
          />
          <div className="admin-chip">Admin</div>
        </header>

        {renderPage()}
      </main>

      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
