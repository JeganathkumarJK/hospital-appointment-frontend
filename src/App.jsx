import { useEffect, useState } from 'react'
import { getAppointments, predictNoShow } from './services/api'
import AuthPage from './components/Auth/AuthPage'
import PatientPortal from './components/Patient/PatientPortal'
import './App.css'

const navigationItems = [
  { label: "Today's Overview", icon: '📊' },
  { label: 'Appointments', icon: '📅' },
  { label: 'Doctors & Roster', icon: '🩺' },
  { label: 'Smart Waitlist', icon: '📋' },
  { label: 'Reports & Insights', icon: '📈' },
]

const initialAppointments = [
  { id: 'A001', patientId: 'P001', patient: 'Demo Patient', doctor: 'Dr. Kumar', department: 'Cardiology', date: '2026-09-03', time: '10:30 AM', type: 'Consultation', probability: 72, risk: 'HIGH', status: 'PENDING' },
  { id: 'A002', patientId: 'P002', patient: 'Demo Patient 2', doctor: 'Dr. Mehta', department: 'Neurology', date: '2026-09-03', time: '11:00 AM', type: 'Follow-up', probability: 48, risk: 'MEDIUM', status: 'CONFIRMED' },
  { id: 'A003', patientId: 'P003', patient: 'Demo Patient 3', doctor: 'Dr. Shah', department: 'Pediatrics', date: '2026-09-03', time: '11:30 AM', type: 'Consultation', probability: 18, risk: 'LOW', status: 'CONFIRMED' },
  { id: 'A004', patientId: 'P004', patient: 'Demo Patient 4', doctor: 'Dr. Kumar', department: 'Cardiology', date: '2026-09-03', time: '12:00 PM', type: 'New patient', probability: 56, risk: 'MEDIUM', status: 'PENDING' },
  { id: 'A005', patientId: 'P005', patient: 'Demo Patient 5', doctor: 'Dr. Rao', department: 'Orthopedics', date: '2026-09-04', time: '09:00 AM', type: 'Consultation', probability: 29, risk: 'LOW', status: 'CONFIRMED' },
]

const initialWaitlist = [
  { id: 'W001', patientId: 'P006', patient: 'Demo Patient 6', doctor: 'Dr. Kumar', department: 'Cardiology', date: '2026-09-03', time: '10:30 AM', priority: 'HIGH', status: 'WAITING' },
  { id: 'W002', patientId: 'P007', patient: 'Demo Patient 7', doctor: 'Dr. Mehta', department: 'Neurology', date: '2026-09-03', time: '11:00 AM', priority: 'MEDIUM', status: 'WAITING' },
  { id: 'W003', patientId: 'P008', patient: 'Demo Patient 8', doctor: 'Dr. Kumar', department: 'Cardiology', date: '2026-09-04', time: '09:00 AM', priority: 'LOW', status: 'WAITING' },
  { id: 'W004', patientId: 'P009', patient: 'Demo Patient 9', doctor: 'Dr. Shah', department: 'Pediatrics', date: '2026-09-04', time: '11:30 AM', priority: 'MEDIUM', status: 'SLOT_OFFERED' },
]

const scheduleSlots = [
  { time: '10:00 AM', status: 'BOOKED', patient: 'Demo Patient' },
  { time: '10:30 AM', status: 'AVAILABLE' },
  { time: '11:00 AM', status: 'BOOKED', patient: 'Demo Patient 2' },
  { time: '11:30 AM', status: 'AVAILABLE' },
  { time: '12:00 PM', status: 'BOOKED', patient: 'Demo Patient 4' },
  { time: '12:30 PM', status: 'AVAILABLE' },
  { time: '01:00 PM', status: 'BREAK' },
]

const scheduleHeatmapSlots = [
  { time: '09:00 AM', status: 'AVAILABLE' },
  { time: '10:00 AM', status: 'BOOKED', patient: 'Demo Patient' },
  { time: '10:30 AM', status: 'HIGH_RISK', patient: 'Demo Patient 6' },
  { time: '11:00 AM', status: 'BOOKED', patient: 'Demo Patient 2' },
  { time: '11:30 AM', status: 'AVAILABLE' },
  { time: '12:00 PM', status: 'COMPLETED', patient: 'Demo Patient 4' },
  { time: '12:30 PM', status: 'CANCELLED' },
]

const recommendedRescheduleSlots = [
  { date: '2026-09-03', label: 'Today', time: '02:00 PM', value: '14:00', reason: 'Doctor available', featured: true },
  { date: '2026-09-04', label: 'Tomorrow', time: '10:00 AM', value: '10:00', reason: 'Low waiting time', featured: true },
  { date: '2026-09-05', label: 'Saturday', time: '11:30 AM', value: '11:30', reason: 'Available slot', featured: false },
]

const demoPatients = [
  { id: 'P001', name: 'Demo Patient', contact: 'demo.patient@example.test', joined: '2026-08-12' },
  { id: 'P002', name: 'Demo Patient 2', contact: 'demo.patient2@example.test', joined: '2026-08-14' },
  { id: 'P003', name: 'Demo Patient 3', contact: 'demo.patient3@example.test', joined: '2026-08-20' },
  { id: 'P004', name: 'Demo Patient 4', contact: 'demo.patient4@example.test', joined: '2026-08-23' },
  { id: 'P005', name: 'Demo Patient 5', contact: 'demo.patient5@example.test', joined: '2026-08-29' },
]

const demoDoctors = [
  { id: 'D001', name: 'Dr. Kumar', department: 'Cardiology', specialization: 'Interventional Cardiology', appointments: 18, completed: 12, cancelled: 1, highRisk: 3, utilization: 82 },
  { id: 'D002', name: 'Dr. Mehta', department: 'Neurology', specialization: 'Clinical Neurology', appointments: 14, completed: 10, cancelled: 2, highRisk: 2, utilization: 76 },
  { id: 'D003', name: 'Dr. Shah', department: 'Pediatrics', specialization: 'Pediatric Care', appointments: 12, completed: 9, cancelled: 1, highRisk: 1, utilization: 68 },
  { id: 'D004', name: 'Dr. Rao', department: 'Orthopedics', specialization: 'Sports Orthopedics', appointments: 11, completed: 8, cancelled: 1, highRisk: 1, utilization: 61 },
]

function readStoredRecords(key, fallback) {
  try {
    const storedRecords = localStorage.getItem(key)
    return storedRecords ? JSON.parse(storedRecords) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => readStoredRecords('carepilot-auth-user', null))
  const [patientsList, setPatientsList] = useState(() => readStoredRecords('carepilot-patients', demoPatients))
  const [activePage, setActivePage] = useState("Today's Overview")
  const [adminToast, setAdminToast] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [appointmentRecords, setAppointmentRecords] = useState(() => readStoredRecords('carepilot-appointments', initialAppointments))
  const [doctorsList, setDoctorsList] = useState(() => readStoredRecords('carepilot-doctors', demoDoctors))
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    department: 'Cardiology',
    specialization: '',
    room: '',
    hours: '09:00 AM – 04:00 PM',
  })
  const [newDoctorError, setNewDoctorError] = useState('')
  const [formData, setFormData] = useState({ patientId: '', patient: '', doctor: '', department: '', date: '', time: '', type: '' })
  const [formErrors, setFormErrors] = useState({})
  const [saveMessage, setSaveMessage] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [actionConfirmation, setActionConfirmation] = useState(null)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' })
  const [waitlistRecords, setWaitlistRecords] = useState(() => readStoredRecords('carepilot-waitlist', initialWaitlist))
  const [waitlistSearch, setWaitlistSearch] = useState('')
  const [waitlistFilter, setWaitlistFilter] = useState('ALL')
  const [waitlistMessage, setWaitlistMessage] = useState('')
  const [offerCandidate, setOfferCandidate] = useState(null)
  const [scheduleDoctor, setScheduleDoctor] = useState('Dr. Kumar')
  const [scheduleDate, setScheduleDate] = useState('2026-09-03')
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  const [backendError, setBackendError] = useState('')
  const [predictionResult, setPredictionResult] = useState(null)
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false)
  const [predictionError, setPredictionError] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('carepilot-theme') || 'light')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  useEffect(() => {
    localStorage.setItem('carepilot-doctors', JSON.stringify(doctorsList))
  }, [doctorsList])

  const handleAddDoctorSubmit = (e) => {
    e.preventDefault()
    if (!newDoctorForm.name.trim()) {
      setNewDoctorError('Please provide the physician name.')
      return
    }
    const cleanName = newDoctorForm.name.trim()
    const formattedName = cleanName.toLowerCase().startsWith('dr.')
      ? cleanName
      : `Dr. ${cleanName}`

    const nextId = `D${String(doctorsList.length + 1).padStart(3, '0')}`
    const newDoc = {
      id: nextId,
      name: formattedName,
      department: newDoctorForm.department,
      specialization: newDoctorForm.specialization.trim() || `${newDoctorForm.department} Specialist`,
      room: newDoctorForm.room.trim() || 'Main Wing · Consultation Suite',
      hours: newDoctorForm.hours.trim() || '09:00 AM – 04:00 PM',
      appointments: 0,
      completed: 0,
      cancelled: 0,
      highRisk: 0,
      utilization: 0,
    }

    setDoctorsList((prev) => [...prev, newDoc])
    setAdminToast(`${formattedName} has been successfully added to ${newDoctorForm.department} roster.`)
    setIsAddDoctorOpen(false)
    setNewDoctorForm({
      name: '',
      department: 'Cardiology',
      specialization: '',
      room: '',
      hours: '09:00 AM – 04:00 PM',
    })
    setNewDoctorError('')
  }

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('carepilot-auth-user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('carepilot-auth-user')
    }
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('carepilot-patients', JSON.stringify(patientsList))
  }, [patientsList])

  useEffect(() => {
    localStorage.setItem('carepilot-appointments', JSON.stringify(appointmentRecords))
  }, [appointmentRecords])

  useEffect(() => {
    localStorage.setItem('carepilot-waitlist', JSON.stringify(waitlistRecords))
  }, [waitlistRecords])

  useEffect(() => {
    if (activePage !== 'Appointments') return

    let isCurrentRequest = true
    setIsLoadingAppointments(true)
    setBackendError('')

    getAppointments()
      .then((data) => {
        if (!isCurrentRequest) return
        const backendAppointments = Array.isArray(data) ? data : data.appointments
        if (Array.isArray(backendAppointments)) setAppointmentRecords(backendAppointments)
      })
      .catch(() => {
        if (isCurrentRequest) setBackendError('Unable to connect to the backend. Showing demo appointments instead.')
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingAppointments(false)
      })

    return () => { isCurrentRequest = false }
  }, [activePage])

  useEffect(() => {
    if (activePage !== 'Appointment Details' || !selectedAppointment) return

    let isCurrentRequest = true
    setPredictionResult(null)
    setPredictionError('')
    setIsLoadingPrediction(true)

    predictNoShow({
      appointment_id: selectedAppointment.id,
      patient_id: selectedAppointment.patientId,
      appointment_date: selectedAppointment.date,
      appointment_type: selectedAppointment.type,
    })
      .then((data) => {
        if (isCurrentRequest) setPredictionResult({
          probability: Math.round((data.no_show_probability ?? 0) * 100),
          risk: data.risk_level,
          recommendation: data.recommended_action,
          source: 'FastAPI prediction service',
        })
      })
      .catch(() => {
        if (isCurrentRequest) setPredictionError('Prediction service unavailable. Showing the demo prediction.')
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingPrediction(false)
      })

    return () => { isCurrentRequest = false }
  }, [activePage, selectedAppointment])

  const filteredAppointments = appointmentRecords.filter((appointment) => {
    const matchesSearch = [appointment.id, appointment.patientId, appointment.patient, appointment.doctor]
      .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || appointment.status === statusFilter
    const matchesRisk = riskFilter === 'ALL' || appointment.risk === riskFilter
    return matchesSearch && matchesStatus && matchesRisk
  })

  const filteredWaitlist = waitlistRecords.filter((entry) => {
    const matchesSearch = [entry.patientId, entry.patient, entry.doctor, entry.department]
      .some((value) => value.toLowerCase().includes(waitlistSearch.toLowerCase()))
    return matchesSearch && (waitlistFilter === 'ALL' || entry.status === waitlistFilter)
  })

  const todayAppointments = appointmentRecords.filter((appointment) => appointment.date === '2026-09-03')
  const riskCounts = {
    low: appointmentRecords.filter((appointment) => appointment.risk === 'LOW').length,
    medium: appointmentRecords.filter((appointment) => appointment.risk === 'MEDIUM').length,
    high: appointmentRecords.filter((appointment) => appointment.risk === 'HIGH').length,
  }
  const notifications = [
    { id: 'N001', tone: 'high', title: 'High-risk appointments need attention', detail: `${appointmentRecords.filter((appointment) => appointment.risk === 'HIGH').length} appointments have elevated no-show risk.`, time: 'Now' },
    { id: 'N002', tone: 'pending', title: 'Pending confirmations', detail: `${appointmentRecords.filter((appointment) => appointment.status === 'PENDING').length} patients have not confirmed.`, time: 'Today' },
    { id: 'N003', tone: 'waitlist', title: 'Waitlist ready for slot offers', detail: `${waitlistRecords.filter((entry) => entry.status === 'WAITING').length} patients are waiting for availability.`, time: 'Today' },
  ]
  const unreadNotificationCount = notifications.filter((notification) => !readNotifications.includes(notification.id)).length

  const globalResults = globalSearch.trim() ? [
    ...appointmentRecords.filter((appointment) => [appointment.id, appointment.patient, appointment.patientId, appointment.doctor, appointment.department].some((value) => value.toLowerCase().includes(globalSearch.toLowerCase()))).map((appointment) => ({ type: 'Appointment', title: appointment.id, detail: `${appointment.patient} · ${appointment.doctor}`, record: appointment })),
    ...patientsList.filter((patient) => [patient.id, patient.name].some((value) => value.toLowerCase().includes(globalSearch.toLowerCase()))).map((patient) => ({ type: 'Patient', title: patient.name, detail: patient.id, record: patient })),
    ...doctorsList.filter((doctor) => [doctor.id, doctor.name, doctor.department].some((value) => value.toLowerCase().includes(globalSearch.toLowerCase()))).map((doctor) => ({ type: 'Doctor', title: doctor.name, detail: `${doctor.department} · ${doctor.specialization}`, record: doctor })),
  ].slice(0, 6) : []

  const getMatchScore = (entry) => entry.priority === 'HIGH' ? 96 : entry.priority === 'MEDIUM' ? 89 : 74

  const offerWaitlistSlot = (entryId) => {
    setWaitlistRecords((currentRecords) => currentRecords.map((entry) => (
      entry.id === entryId ? { ...entry, status: 'SLOT_OFFERED' } : entry
    )))
    setWaitlistMessage('Slot offered successfully in demo mode.')
  }

  const openOfferConfirmation = (entry) => setOfferCandidate(entry)

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('carepilot-auth-user')
  }

  const handleRegisterPatient = (newPatient) => {
    setPatientsList((current) => [...current, newPatient])
  }

  const handlePatientBookAppointment = (data) => {
    const nextId = `A${String(appointmentRecords.length + 1).padStart(3, '0')}`
    const newApt = {
      id: nextId,
      patientId: data.patientId,
      patient: data.patient,
      doctor: data.doctor,
      department: data.department,
      date: data.date,
      time: data.time,
      type: data.type,
      probability: 14,
      risk: 'LOW',
      status: 'CONFIRMED',
      notes: data.notes || '',
    }
    setAppointmentRecords((prev) => [newApt, ...prev])
  }

  const handlePatientConfirmAppointment = (aptId) => {
    setAppointmentRecords((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'CONFIRMED' } : apt))
    )
  }

  const handlePatientCancelAppointment = (aptId) => {
    setAppointmentRecords((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'CANCELLED' } : apt))
    )
  }

  const handlePatientRescheduleAppointment = (aptId, newDate, newTime) => {
    setAppointmentRecords((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, date: newDate, time: newTime, status: 'RESCHEDULED' } : apt))
    )
  }

  const updateFormField = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  const saveAppointment = (event) => {
    event.preventDefault()
    const requiredFields = ['patientId', 'patient', 'doctor', 'department', 'date', 'time', 'type']
    const nextErrors = requiredFields.reduce((errors, field) => {
      if (!formData[field].trim()) errors[field] = 'Required'
      return errors
    }, {})

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      setSaveMessage('Please complete all required fields.')
      return
    }

    const nextId = `A${String(appointmentRecords.length + 1).padStart(3, '0')}`
    setAppointmentRecords((currentRecords) => [...currentRecords, {
      id: nextId, ...formData, probability: 0, risk: 'LOW', status: 'PENDING',
    }])
    setFormData({ patientId: '', patient: '', doctor: '', department: '', date: '', time: '', type: '' })
    setFormErrors({})
    setSaveMessage('Appointment saved successfully in demo mode.')
    setActivePage('Appointments')
  }

  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setActionMessage('')
    setIsRescheduling(false)
    setActivePage('Appointment Details')
  }

  const openPatientProfile = (patient) => {
    setSelectedPatient(patient)
    if (patient?.name) {
      setSearchQuery(patient.name)
    }
    setActivePage('Appointments')
  }

  const openDoctorProfile = (doctor) => {
    setSelectedDoctor(doctor)
    setActivePage('Doctors & Roster')
  }

  const openGlobalResult = (result) => {
    setGlobalSearch('')
    if (result.type === 'Appointment') openAppointmentDetails(result.record)
    if (result.type === 'Patient') {
      const patientApt = appointmentRecords.find(
        (a) => a.patient === result.record.name || a.patientId === result.record.id
      )
      if (patientApt) {
        openAppointmentDetails(patientApt)
      } else {
        openPatientProfile(result.record)
      }
    }
    if (result.type === 'Doctor') {
      openDoctorProfile(result.record)
    }
  }

  const updateSelectedAppointment = (updates) => {
    setAppointmentRecords((currentRecords) => currentRecords.map((appointment) => (
      appointment.id === selectedAppointment.id ? { ...appointment, ...updates } : appointment
    )))
    setSelectedAppointment((currentAppointment) => ({ ...currentAppointment, ...updates }))
  }

  const applyConfirmSelectedAppointment = () => {
    updateSelectedAppointment({ status: 'CONFIRMED' })
    setActionMessage('Appointment confirmed successfully in demo mode.')
  }

  const applyCancelSelectedAppointment = () => {
    updateSelectedAppointment({ status: 'CANCELLED' })
    setActionMessage('Appointment cancelled. Slot available for the waitlist.')
  }

  const confirmSelectedAppointment = () => setActionConfirmation({ type: 'confirm' })
  const cancelSelectedAppointment = () => setActionConfirmation({ type: 'cancel' })

  const executeConfirmedAction = () => {
    if (actionConfirmation?.type === 'confirm') applyConfirmSelectedAppointment()
    if (actionConfirmation?.type === 'cancel') applyCancelSelectedAppointment()
    setActionConfirmation(null)
  }

  const rescheduleSelectedAppointment = (event) => {
    event.preventDefault()
    if (!rescheduleData.date || !rescheduleData.time) {
      setActionMessage('Please select a new date and time.')
      return
    }
    updateSelectedAppointment({ date: rescheduleData.date, time: rescheduleData.time, status: 'RESCHEDULED' })
    setIsRescheduling(false)
    setActionMessage('Appointment rescheduled successfully in demo mode.')
  }

  const displayedPrediction = predictionResult || selectedAppointment
  const predictionFactors = predictionResult?.factors || (selectedAppointment && [
    selectedAppointment.status === 'PENDING' ? 'Confirmation has not been received' : 'Appointment confirmation is recorded',
    selectedAppointment.risk === 'HIGH' ? 'Previous appointment history may indicate missed visits' : 'Appointment profile has a lower observed risk pattern',
    'Appointment timing and booking lead time may influence attendance',
  ])

  if (!currentUser) {
    return (
      <div className="app-shell" data-theme={theme}>
        <AuthPage
          onLogin={handleLogin}
          registeredPatients={patientsList}
          onRegisterNewPatient={handleRegisterPatient}
        />
      </div>
    )
  }

  if (currentUser.role === 'patient') {
    return (
      <div className="patient-portal-container" data-theme={theme}>
        <PatientPortal
          patientUser={currentUser}
          appointments={appointmentRecords}
          waitlist={waitlistRecords}
          doctors={doctorsList}
          onBookAppointment={handlePatientBookAppointment}
          onConfirmAppointment={handlePatientConfirmAppointment}
          onCancelAppointment={handlePatientCancelAppointment}
          onRescheduleAppointment={handlePatientRescheduleAppointment}
          onLogout={handleLogout}
          onSwitchToAdmin={() =>
            setCurrentUser({
              id: 'ADM-01',
              name: 'Dr. Sarah Jenkins',
              email: 'admin@carepilot.hospital',
              role: 'admin',
              title: 'Hospital Administrator',
              department: 'Executive Medical Staff',
            })
          }
        />
      </div>
    )
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">+</div>
          <div>
            <strong>CarePilot</strong>
            <span>Hospital operations</span>
          </div>
        </div>

        <div className="workspace-label">Workspace</div>
        <nav aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <button
              className={`nav-item ${activePage === item.label ? 'active' : ''}`}
              key={item.label}
              onClick={() => {
                setActivePage(item.label)
                setIsSidebarOpen(false)
              }}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" aria-hidden="true"></div>
          <div>
            <strong>System operational</strong>
            <span>Last synced just now</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
          <div className="breadcrumb">
            <span>Hospital AI Appointment Management</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>
          <div className="global-search"><span aria-hidden="true">⌕</span><input type="search" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search patients, appointments, doctors..." aria-label="Global search" />{globalResults.length > 0 && <div className="global-results">{globalResults.map((result) => <button type="button" key={`${result.type}-${result.title}`} onClick={() => openGlobalResult(result)}><span className="result-type">{result.type}</span><span><strong>{result.title}</strong><small>{result.detail}</small></span><b>→</b></button>)}</div>}</div>
          <div className="topbar-actions">
            <div className="notification-wrap"><button className="icon-button" type="button" aria-label="View notifications" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>♢{unreadNotificationCount > 0 && <span className="notification-count">{unreadNotificationCount}</span>}</button>{isNotificationOpen && <div className="notification-panel"><div className="notification-heading"><div><strong>Notifications</strong><span>{unreadNotificationCount} unread</span></div><button type="button" onClick={() => setReadNotifications(notifications.map((notification) => notification.id))}>Mark all read</button></div>{notifications.map((notification) => <button className={`notification-item ${readNotifications.includes(notification.id) ? 'read' : ''}`} type="button" key={notification.id} onClick={() => setReadNotifications((current) => [...new Set([...current, notification.id])])}><span className={`notification-dot ${notification.tone}`}></span><span><strong>{notification.title}</strong><small>{notification.detail}</small><em>{notification.time}</em></span></button>)}</div>}</div>
            <button className="theme-toggle" type="button" onClick={() => { const nextTheme = theme === 'light' ? 'dark' : 'light'; setTheme(nextTheme); localStorage.setItem('carepilot-theme', nextTheme) }} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? '☾' : '☀'} <span>{theme === 'light' ? 'Dark' : 'Light'}</span></button>
            <div className="topbar-user-menu">
              <button
                type="button"
                className="topbar-switch-btn"
                onClick={() =>
                  setCurrentUser({
                    id: 'P001',
                    name: 'Demo Patient',
                    email: 'demo.patient@example.test',
                    role: 'patient',
                  })
                }
                title="Switch to patient portal view"
              >
                Patient View ↗
              </button>
              <div className="profile">
                <div className="avatar">
                  {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="profile-copy">
                  <strong>{currentUser?.name || 'Admin'}</strong>
                  <span className="role-tag-badge">Admin</span>
                </div>
              </div>
              <button
                type="button"
                className="topbar-logout-btn"
                onClick={handleLogout}
                title="Sign out of CarePilot"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <section className="page-content" aria-labelledby="page-title">
          {adminToast && (
            <div className="admin-toast-banner" role="status">
              <span>{adminToast}</span>
              <button
                type="button"
                onClick={() => setAdminToast('')}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="page-heading">
            <div>
              <p className="eyebrow">{activePage}</p>
              <h1 id="page-title">
                {activePage === "Today's Overview" ? "Today's Clinic Command Center" :
                 activePage === "Appointments" ? "Master Appointment Directory" :
                 activePage === "Doctors & Roster" ? "Doctors & Department Capacity" :
                 activePage === "Smart Waitlist" ? "Smart Waitlist & Standby Engine" :
                 activePage === "Reports & Insights" ? "Operational Reports & Insights" :
                 activePage === "Add Appointment" ? "Book New Patient Appointment" :
                 activePage === "Appointment Details" ? "Appointment Information & AI Risk" :
                 activePage}
              </h1>
              <p className="page-description">
                {activePage === "Today's Overview" ? "Live overview of today's schedule, patient confirmations, and proactive no-show prevention." :
                 activePage === "Appointments" ? "Search, filter, check-in, and manage all patient consultations in real time." :
                 activePage === "Doctors & Roster" ? "Review provider availability, assigned clinic rooms, and patient loads." :
                 activePage === "Smart Waitlist" ? "Automatically match waiting patients into newly available or cancelled appointment slots." :
                 activePage === "Reports & Insights" ? "High-level summary of patient attendance, recovered capacity, and clinic performance." :
                 "CarePilot Hospital Clinical Operations System."}
              </p>
            </div>
            <div className="date-chip"><span aria-hidden="true">◷</span> Thursday, September 3, 2026</div>
          </div>

          {/* TAB 1: TODAY'S OVERVIEW */}
          {activePage === "Today's Overview" ? (
            <div className="dashboard-content" style={{ marginTop: 24 }}>
              {/* Top Key Metrics */}
              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-icon teal">📅</div>
                  <div className="stat-copy">
                    <span>Today's Total Visits</span>
                    <strong>{todayAppointments.length}</strong>
                    <small>Scheduled for care today</small>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-icon blue">✓</div>
                  <div className="stat-copy">
                    <span>Confirmed Patients</span>
                    <strong>{appointmentRecords.filter((a) => a.status === 'CONFIRMED').length}</strong>
                    <small>Ready for consultation</small>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-icon amber">!</div>
                  <div className="stat-copy">
                    <span>Pending Confirmation</span>
                    <strong>{appointmentRecords.filter((a) => a.status === 'PENDING').length}</strong>
                    <small>Needs reminder outreach</small>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-icon coral">△</div>
                  <div className="stat-copy">
                    <span>AI High-Risk No-Shows</span>
                    <strong>{appointmentRecords.filter((a) => a.risk === 'HIGH').length}</strong>
                    <small>Proactive action recommended</small>
                  </div>
                </article>
              </div>

              {/* Urgent Outreach Queue (AI Risk Prevention) */}
              <section className="urgent-queue-panel">
                <div className="urgent-queue-header">
                  <div>
                    <h2><span>🚨</span> Urgent Attention Queue (AI Risk Prevention)</h2>
                    <p>Patients predicted with elevated no-show risk. Take proactive action to protect clinic capacity.</p>
                  </div>
                  <span className="demo-label">Proactive Care</span>
                </div>

                <div className="urgent-queue-grid">
                  {appointmentRecords.filter((a) => a.risk === 'HIGH' || (a.risk === 'MEDIUM' && a.status === 'PENDING')).slice(0, 3).map((apt) => (
                    <div className="urgent-card" key={apt.id}>
                      <div className="urgent-card-top">
                        <div>
                          <strong>{apt.patient} ({apt.patientId})</strong>
                          <span>{apt.doctor} · {apt.department} · {apt.date} at {apt.time}</span>
                        </div>
                        <span className={`risk-badge ${apt.risk.toLowerCase()}`}>
                          {apt.probability}% {apt.risk} RISK
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#637987' }}>
                        Status: <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span>
                      </div>

                      <div className="urgent-card-actions">
                        <button
                          type="button"
                          className="btn-urgent-remind"
                          onClick={() => setAdminToast(`📞 Automated SMS & Call Reminder sent to ${apt.patient} (${apt.patientId}).`)}
                        >
                          📞 Send Reminder
                        </button>
                        {apt.status !== 'CONFIRMED' && (
                          <button
                            type="button"
                            className="btn-urgent-confirm"
                            onClick={() => {
                              setAppointmentRecords((prev) => prev.map((a) => a.id === apt.id ? { ...a, status: 'CONFIRMED' } : a))
                              setAdminToast(`✓ ${apt.patient} marked as Confirmed!`)
                            }}
                          >
                            ✓ Mark Confirmed
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-urgent-confirm"
                          onClick={() => openAppointmentDetails(apt)}
                        >
                          Review Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Today's Schedule at a Glance */}
              <section className="table-panel" style={{ marginTop: 22 }}>
                <div className="table-heading">
                  <div>
                    <h2>Today's Live Appointments</h2>
                    <p>Thursday, September 3, 2026 · {todayAppointments.length} patients scheduled</p>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setActivePage('Add Appointment')}
                  >
                    + Book Walk-in / Caller
                  </button>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>AI Risk Level</th>
                        <th>Status</th>
                        <th>Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td><strong>{apt.time}</strong></td>
                          <td><strong>{apt.patient}</strong> <small>{apt.patientId}</small></td>
                          <td>{apt.doctor}</td>
                          <td>{apt.department}</td>
                          <td>
                            <span className={`risk-badge ${apt.risk.toLowerCase()}`}>
                              {apt.risk} ({apt.probability}%)
                            </span>
                          </td>
                          <td><span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                          <td>
                            {apt.status === 'PENDING' && (
                              <button
                                type="button"
                                className="table-action-pill"
                                onClick={() => {
                                  setAppointmentRecords((prev) => prev.map((a) => a.id === apt.id ? { ...a, status: 'CONFIRMED' } : a))
                                  setAdminToast(`✓ ${apt.patient} attendance confirmed.`)
                                }}
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              type="button"
                              className="table-action-pill"
                              onClick={() => openAppointmentDetails(apt)}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : activePage === 'Appointments' ? (
            /* TAB 2: APPOINTMENTS */
            <div className="appointments-content">
              {saveMessage && <div className="form-message success-message" role="status">{saveMessage}</div>}
              <div className="appointment-toolbar">
                <label className="search-field">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    placeholder="Search by patient, doctor, or ID..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
                <div className="filter-group">
                  <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <select aria-label="Filter by risk" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                    <option value="ALL">All risk levels</option>
                    <option value="LOW">Low risk</option>
                    <option value="MEDIUM">Medium risk</option>
                    <option value="HIGH">High risk</option>
                  </select>
                </div>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => { setSaveMessage(''); setActivePage('Add Appointment') }}
                >
                  <span aria-hidden="true">+</span> Book New Appointment
                </button>
              </div>

              <section className="table-panel" aria-labelledby="appointments-table-title">
                <div className="table-heading">
                  <div>
                    <h2 id="appointments-table-title">Master Appointment Book</h2>
                    <p>{filteredAppointments.length} appointments listed</p>
                  </div>
                  <span className="demo-label">Live Clinic Data</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Date &amp; Time</th>
                        <th>Type</th>
                        <th>AI Attendance Risk</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td><strong className="appointment-id">{appointment.id}</strong></td>
                          <td><strong>{appointment.patient}</strong> <small>{appointment.patientId}</small></td>
                          <td>{appointment.doctor}</td>
                          <td>{appointment.department}</td>
                          <td><strong>{appointment.date}</strong> <small>{appointment.time}</small></td>
                          <td>{appointment.type}</td>
                          <td>
                            <span className={`risk-badge ${appointment.risk.toLowerCase()}`}>
                              {appointment.risk} ({appointment.probability}%)
                            </span>
                          </td>
                          <td><span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span></td>
                          <td>
                            <button
                              className="table-action-pill"
                              type="button"
                              onClick={() => openAppointmentDetails(appointment)}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAppointments.length === 0 && (
                    <div className="table-empty">
                      <strong>No appointments match your filters.</strong>
                      <span>Try changing your search term or status filter.</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : activePage === 'Doctors & Roster' ? (
            /* TAB 3: DOCTORS & ROSTER */
            <div className="doctors-content">
              <div className="profile-intro">
                <div>
                  <p className="eyebrow">Medical Staff</p>
                  <h2>Specialist Doctors &amp; Department Capacity</h2>
                  <p>Current patient load, active appointments, and clinic capacity utilization.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="demo-label">Roster ({doctorsList.length})</span>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      setNewDoctorError('')
                      setIsAddDoctorOpen(true)
                    }}
                    style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    + Add New Doctor
                  </button>
                </div>
              </div>

              {isAddDoctorOpen && (
                <div className="modal-backdrop" role="presentation">
                  <div className="confirmation-modal" style={{ maxWidth: '480px', width: '92%' }} role="dialog" aria-modal="true">
                    <button
                      className="modal-close"
                      type="button"
                      aria-label="Close modal"
                      onClick={() => setIsAddDoctorOpen(false)}
                    >
                      ×
                    </button>
                    <p className="eyebrow">Clinical Operations</p>
                    <h2 style={{ fontSize: '20px', margin: '0 0 6px' }}>Add Specialist Doctor</h2>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 16px' }}>
                      Register a physician to the hospital roster, department directory, and patient booking catalog.
                    </p>

                    {newDoctorError && (
                      <div className="form-message error-message" style={{ marginBottom: '14px' }} role="alert">
                        {newDoctorError}
                      </div>
                    )}

                    <form onSubmit={handleAddDoctorSubmit}>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <label style={{ display: 'grid', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}>
                          Doctor Full Name *
                          <input
                            type="text"
                            placeholder="e.g. Dr. Ananya Sharma"
                            value={newDoctorForm.name}
                            onChange={(e) => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                            style={{ height: '36px', padding: '0 10px', border: '1px solid var(--line)', borderRadius: '6px', font: 'inherit', fontSize: '13px' }}
                            required
                          />
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <label style={{ display: 'grid', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}>
                            Department *
                            <select
                              value={newDoctorForm.department}
                              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, department: e.target.value })}
                              style={{ height: '36px', padding: '0 8px', border: '1px solid var(--line)', borderRadius: '6px', font: 'inherit', fontSize: '12px', background: 'white' }}
                            >
                              <option value="Cardiology">Cardiology</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="General Medicine">General Medicine</option>
                              <option value="Dermatology">Dermatology</option>
                              <option value="ENT">ENT</option>
                              <option value="Oncology">Oncology</option>
                            </select>
                          </label>

                          <label style={{ display: 'grid', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}>
                            Consultation Room
                            <input
                              type="text"
                              placeholder="e.g. Room 304"
                              value={newDoctorForm.room}
                              onChange={(e) => setNewDoctorForm({ ...newDoctorForm, room: e.target.value })}
                              style={{ height: '36px', padding: '0 10px', border: '1px solid var(--line)', borderRadius: '6px', font: 'inherit', fontSize: '12px' }}
                            />
                          </label>
                        </div>

                        <label style={{ display: 'grid', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}>
                          Specialization &amp; Focus Area
                          <input
                            type="text"
                            placeholder="e.g. Heart Failure &amp; Hypertension"
                            value={newDoctorForm.specialization}
                            onChange={(e) => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })}
                            style={{ height: '36px', padding: '0 10px', border: '1px solid var(--line)', borderRadius: '6px', font: 'inherit', fontSize: '12px' }}
                          />
                        </label>

                        <label style={{ display: 'grid', gap: '5px', fontSize: '11px', fontWeight: 'bold' }}>
                          Shift Schedule
                          <input
                            type="text"
                            placeholder="e.g. 09:00 AM – 04:00 PM"
                            value={newDoctorForm.hours}
                            onChange={(e) => setNewDoctorForm({ ...newDoctorForm, hours: e.target.value })}
                            style={{ height: '36px', padding: '0 10px', border: '1px solid var(--line)', borderRadius: '6px', font: 'inherit', fontSize: '12px' }}
                          />
                        </label>
                      </div>

                      <div className="modal-actions" style={{ marginTop: '18px' }}>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => setIsAddDoctorOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="primary-button"
                          type="submit"
                        >
                          Save &amp; Add to Roster
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="doctor-grid">
                {doctorsList.map((doctor) => (
                  <article className="doctor-card" key={doctor.id}>
                    <div className="doctor-card-top">
                      <div className="doctor-avatar">
                        {doctor.name.replace('Dr. ', '').split(' ').map((part) => part[0]).join('')}
                      </div>
                      <div>
                        <span className="appointment-id">{doctor.id}</span>
                        <h3>{doctor.name}</h3>
                        <p>{doctor.department}</p>
                      </div>
                    </div>
                    <div className="doctor-specialty">{doctor.specialization}</div>
                    <div className="doctor-stats">
                      <div><strong>{doctor.appointments || 0}</strong><span>Today's visits</span></div>
                      <div><strong>{doctor.highRisk || 0}</strong><span>High risk</span></div>
                      <div><strong>{doctor.utilization || 0}%</strong><span>Capacity</span></div>
                    </div>
                    <div className="capacity-bar profile-capacity" style={{ margin: '14px 0 10px' }}>
                      <span style={{ width: `${doctor.utilization || 0}%` }}></span>
                    </div>
                    <button
                      className="primary-button"
                      style={{ width: '100%', justifyContent: 'center' }}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, doctor: doctor.name, department: doctor.department }))
                        setActivePage('Add Appointment')
                      }}
                    >
                      + Book with {doctor.name}
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : activePage === 'Smart Waitlist' ? (
            /* TAB 4: SMART WAITLIST */
            <div className="waitlist-content">
              {waitlistMessage && <div className="form-message success-message" role="status">{waitlistMessage}</div>}
              
              <section className="available-match-panel">
                <div>
                  <p className="eyebrow">Instant Slot Available</p>
                  <h2>Dr. Kumar <span>· Cardiology</span></h2>
                  <p>Next Open Slot: September 10, 2026 · 10:30 AM</p>
                </div>
                <div>
                  <strong>AI Match Candidate: Demo Patient 6</strong>
                  <span>96% compatibility · High priority patient waiting</span>
                </div>
              </section>

              <section className="table-panel" aria-labelledby="waitlist-table-title" style={{ marginTop: 20 }}>
                <div className="table-heading">
                  <div>
                    <h2 id="waitlist-table-title">Standby Waitlist Directory</h2>
                    <p>{filteredWaitlist.length} patients waiting for open consultation slots</p>
                  </div>
                  <span className="demo-label">Auto-Match Enabled</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Preferred Doctor</th>
                        <th>Department</th>
                        <th>Preferred Date &amp; Time</th>
                        <th>Priority</th>
                        <th>AI Fit</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWaitlist.map((entry) => (
                        <tr key={entry.id}>
                          <td><strong>{entry.patient}</strong> <small>{entry.patientId}</small></td>
                          <td>{entry.doctor}</td>
                          <td>{entry.department}</td>
                          <td>{entry.date} at {entry.time}</td>
                          <td><span className={`risk-badge ${entry.priority.toLowerCase()}`}>{entry.priority}</span></td>
                          <td><strong className="match-score">{getMatchScore(entry)}%</strong></td>
                          <td><span className={`status-badge ${entry.status.toLowerCase()}`}>{entry.status.replace('_', ' ')}</span></td>
                          <td>
                            <button
                              className="table-action-pill"
                              type="button"
                              onClick={() => openOfferConfirmation(entry)}
                              disabled={entry.status !== 'WAITING'}
                            >
                              {entry.status === 'WAITING' ? '⚡ Offer Slot' : 'Slot Offered'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {offerCandidate && (
                <div className="modal-backdrop" role="presentation">
                  <div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="offer-title">
                    <button className="modal-close" type="button" aria-label="Close offer confirmation" onClick={() => setOfferCandidate(null)}>×</button>
                    <p className="eyebrow">Slot Offer Confirmation</p>
                    <h2 id="offer-title">Offer this opening to {offerCandidate.patient}?</h2>
                    <p>An automated notification and clinic pass will be sent to the patient.</p>
                    <div className="modal-slot">
                      <strong>{offerCandidate.doctor} · {offerCandidate.department}</strong>
                      <span>{offerCandidate.date} · {offerCandidate.time}</span>
                      <b>{getMatchScore(offerCandidate)}% compatibility score</b>
                    </div>
                    <div className="modal-actions">
                      <button className="secondary-button" type="button" onClick={() => setOfferCandidate(null)}>Cancel</button>
                      <button className="primary-button" type="button" onClick={() => { offerWaitlistSlot(offerCandidate.id); setOfferCandidate(null) }}>Confirm &amp; Send Offer</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activePage === 'Reports & Insights' ? (
            /* TAB 5: REPORTS & INSIGHTS */
            <div className="analytics-content">
              <div className="analytics-kpis">
                <article>
                  <span>Overall Attendance</span>
                  <strong>91%</strong>
                  <small>+14% with AI proactive reminders</small>
                </article>
                <article>
                  <span>Confirmed Attendance</span>
                  <strong>82%</strong>
                  <small>82 of 100 confirmed ahead of visit</small>
                </article>
                <article>
                  <span>Recovered Appointment Slots</span>
                  <strong>5 Slots</strong>
                  <small>Backfilled via Smart Waitlist</small>
                </article>
                <article>
                  <span>Current No-Show Rate</span>
                  <strong>9%</strong>
                  <small className="negative-text">Well below 19% industry benchmark</small>
                </article>
              </div>

              <div className="analytics-grid">
                <section className="analytics-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Department Slot Utilization</h2>
                      <p>Capacity utilized across active hospital specialties</p>
                    </div>
                  </div>
                  <div className="department-bars">
                    <div><span>Cardiology</span><strong>88%</strong><div className="bar-track"><i className="bar-fill teal" style={{ width: '88%' }}></i></div></div>
                    <div><span>Neurology</span><strong>76%</strong><div className="bar-track"><i className="bar-fill blue" style={{ width: '76%' }}></i></div></div>
                    <div><span>Pediatrics</span><strong>68%</strong><div className="bar-track"><i className="bar-fill mint" style={{ width: '68%' }}></i></div></div>
                    <div><span>Orthopedics</span><strong>61%</strong><div className="bar-track"><i className="bar-fill amber" style={{ width: '61%' }}></i></div></div>
                  </div>
                </section>

                <section className="analytics-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>AI Risk Categorization</h2>
                      <p>Patient population grouped by attendance likelihood</p>
                    </div>
                  </div>
                  <div className="horizontal-bars">
                    <div><span><i className="bar-dot low"></i>Low Risk</span><strong>{riskCounts.low}</strong><div className="bar-track"><i className="bar-fill low" style={{ width: '60%' }}></i></div></div>
                    <div><span><i className="bar-dot medium"></i>Medium Risk</span><strong>{riskCounts.medium}</strong><div className="bar-track"><i className="bar-fill medium" style={{ width: '25%' }}></i></div></div>
                    <div><span><i className="bar-dot high"></i>High Risk</span><strong>{riskCounts.high}</strong><div className="bar-track"><i className="bar-fill high" style={{ width: '15%' }}></i></div></div>
                  </div>
                </section>
              </div>
            </div>
          ) : activePage === 'Appointment Details' && selectedAppointment ? (
            <div className="details-content">
              <button className="back-button" type="button" onClick={() => setActivePage('Appointments')}><span aria-hidden="true">←</span> Back to appointments</button>
              <div className="details-title-row"><div><span className="appointment-id">{selectedAppointment.id}</span><h2>{selectedAppointment.patient}</h2><p>{selectedAppointment.doctor} · {selectedAppointment.department}</p></div><span className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>{selectedAppointment.status}</span></div>
              <div className="details-grid">
                <section className="detail-panel" aria-labelledby="information-title"><div className="detail-panel-heading"><h2 id="information-title">Appointment information</h2><span>Demo record</span></div><dl className="details-list"><div><dt>Patient ID</dt><dd>{selectedAppointment.patientId}</dd></div><div><dt>Patient name</dt><dd>{selectedAppointment.patient}</dd></div><div><dt>Doctor</dt><dd>{selectedAppointment.doctor}</dd></div><div><dt>Department</dt><dd>{selectedAppointment.department}</dd></div><div><dt>Date</dt><dd>{selectedAppointment.date}</dd></div><div><dt>Time</dt><dd>{selectedAppointment.time}</dd></div><div><dt>Appointment type</dt><dd>{selectedAppointment.type}</dd></div><div><dt>Status</dt><dd>{selectedAppointment.status}</dd></div></dl></section>
                <section className="detail-panel prediction-panel" aria-labelledby="prediction-title"><div className="detail-panel-heading"><h2 id="prediction-title">AI no-show prediction</h2><span className="demo-label">{predictionResult ? 'Backend result' : 'Demo fallback'}</span></div>{isLoadingPrediction ? <div className="prediction-loading">Loading prediction...</div> : <><div className="prediction-score"><strong>{displayedPrediction.probability}%</strong><span>probability of no-show</span></div><div className="prediction-meter"><span className={displayedPrediction.risk.toLowerCase()} style={{ width: `${displayedPrediction.probability}%` }}></span></div><div className="prediction-risk"><span>Risk level</span><span className={`risk-badge ${displayedPrediction.risk.toLowerCase()}`}>{displayedPrediction.risk}</span></div><div className="explainability"><strong>Possible contributing factors</strong><ul>{predictionFactors.map((factor) => <li key={factor}>{factor}</li>)}</ul></div><div className="recommendation"><span className="recommendation-icon" aria-hidden="true">!</span><div><strong>AI recommendation</strong><p>{predictionResult?.recommendation || (selectedAppointment.risk === 'HIGH' ? 'Early reminder, confirmation request, and rescheduling option.' : selectedAppointment.risk === 'MEDIUM' ? 'Reminder and confirmation request.' : 'Normal appointment reminder.')}</p></div></div><p className="prediction-note">{predictionError || predictionResult?.source || 'This prediction is for demonstration only. It will come from FastAPI after backend integration.'}</p></>}</section>
              </div>
              <section className="action-panel" aria-labelledby="actions-title"><div className="action-panel-heading"><div><h2 id="actions-title">Appointment actions</h2><p>Changes are simulated locally until the API is connected.</p></div>{actionMessage && <span className="action-message" role="status">{actionMessage}</span>}</div>{isRescheduling ? <form className="reschedule-form smart-reschedule" onSubmit={rescheduleSelectedAppointment}><div className="recommended-slots"><strong>Recommended slots</strong><span>Suggestions are based on demo availability.</span>{recommendedRescheduleSlots.map((slot) => <button type="button" className={`recommended-slot ${slot.featured ? 'featured' : ''}`} key={`${slot.date}-${slot.time}`} onClick={() => setRescheduleData({ date: slot.date, time: slot.value })}><span>{slot.featured ? '★' : '○'}</span><strong>{slot.label} · {slot.time}</strong><small>{slot.reason}</small></button>)}</div><div className="custom-reschedule"><label>New date<input type="date" value={rescheduleData.date} min="2026-09-03" onChange={(event) => setRescheduleData({ ...rescheduleData, date: event.target.value })} /></label><label>New time<input type="time" value={rescheduleData.time} onChange={(event) => setRescheduleData({ ...rescheduleData, time: event.target.value })} /></label><div><button className="secondary-button" type="button" onClick={() => setIsRescheduling(false)}>Cancel</button><button className="primary-button" type="submit">Save new time</button></div></div></form> : <div className="action-buttons"><button className="confirm-button" type="button" onClick={confirmSelectedAppointment} disabled={selectedAppointment.status === 'CANCELLED'}>✓ Confirm</button><button className="reschedule-button" type="button" onClick={() => setIsRescheduling(true)} disabled={selectedAppointment.status === 'CANCELLED'}>◷ Reschedule</button><button className="cancel-button" type="button" onClick={cancelSelectedAppointment} disabled={selectedAppointment.status === 'CANCELLED'}>× Cancel</button></div>}</section>
              {actionConfirmation && <div className="modal-backdrop" role="presentation"><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-action-title"><button className="modal-close" type="button" aria-label="Close confirmation" onClick={() => setActionConfirmation(null)}>×</button><p className="eyebrow">Appointment action</p><h2 id="appointment-action-title">{actionConfirmation.type === 'cancel' ? 'Cancel appointment?' : 'Confirm appointment?'}</h2><p>{actionConfirmation.type === 'cancel' ? 'This will release the appointment slot for possible waitlist matching.' : 'This will mark the appointment as confirmed.'}</p><div className="modal-slot"><strong>{selectedAppointment.patient} · {selectedAppointment.id}</strong><span>{selectedAppointment.date} · {selectedAppointment.time}</span></div><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setActionConfirmation(null)}>Keep appointment</button><button className={`primary-button ${actionConfirmation.type === 'cancel' ? 'danger-primary' : ''}`} type="button" onClick={executeConfirmedAction}>{actionConfirmation.type === 'cancel' ? 'Cancel appointment' : 'Confirm appointment'}</button></div></div></div>}
            </div>
          ) : activePage === 'Add Appointment' ? (
            <div className="form-content">
              <div className="form-intro"><div><h2>Appointment information</h2><p>Use demo details only. Medical information is not required.</p></div><span className="demo-label">Frontend only</span></div>
              {saveMessage && <div className="form-message error-message" role="alert">{saveMessage}</div>}
              <form className="appointment-form" onSubmit={saveAppointment} noValidate>
                <div className="form-section"><h3>Patient details</h3><div className="form-grid">
                  <label>Patient ID<input name="patientId" value={formData.patientId} onChange={updateFormField} placeholder="Example: P006" />{formErrors.patientId && <small className="field-error">{formErrors.patientId}</small>}</label>
                  <label>Patient name<input name="patient" value={formData.patient} onChange={updateFormField} placeholder="Example: Demo Patient 6" />{formErrors.patient && <small className="field-error">{formErrors.patient}</small>}</label>
                </div></div>
                <div className="form-section"><h3>Appointment details</h3><div className="form-grid">
                  <label>Doctor
                    <select name="doctor" value={formData.doctor} onChange={updateFormField}>
                      <option value="">Select a doctor</option>
                      {doctorsList.map((doc) => (
                        <option key={doc.id} value={doc.name}>{doc.name} ({doc.department})</option>
                      ))}
                    </select>
                    {formErrors.doctor && <small className="field-error">{formErrors.doctor}</small>}
                  </label>
                  <label>Department<select name="department" value={formData.department} onChange={updateFormField}><option value="">Select a department</option><option>Cardiology</option><option>Neurology</option><option>Pediatrics</option><option>Orthopedics</option></select>{formErrors.department && <small className="field-error">{formErrors.department}</small>}</label>
                  <label>Appointment date<input type="date" name="date" value={formData.date} onChange={updateFormField} min="2026-09-03" />{formErrors.date && <small className="field-error">{formErrors.date}</small>}</label>
                  <label>Appointment time<input type="time" name="time" value={formData.time} onChange={updateFormField} />{formErrors.time && <small className="field-error">{formErrors.time}</small>}</label>
                  <label>Appointment type<select name="type" value={formData.type} onChange={updateFormField}><option value="">Select appointment type</option><option>Consultation</option><option>Follow-up</option><option>New patient</option></select>{formErrors.type && <small className="field-error">{formErrors.type}</small>}</label>
                </div></div>
                <div className="form-actions"><button className="secondary-button" type="button" onClick={() => setActivePage('Appointments')}>Cancel</button><button className="primary-button" type="submit">Save appointment</button></div>
              </form>
            </div>
          ) : activePage === 'Doctor Profile' ? (
            <div className="details-content">
              <button className="back-button" type="button" onClick={() => setActivePage('Doctors & Roster')}>
                <span aria-hidden="true">←</span> Back to Doctors & Roster
              </button>
              <div className="details-title-row">
                <div>
                  <span className="appointment-id">{selectedDoctor?.department || 'Cardiology'}</span>
                  <h2>{selectedDoctor?.name || 'Dr. Kumar'}</h2>
                  <p>{selectedDoctor?.specialty || 'Senior Consultant'} · {selectedDoctor?.room || 'Main Wing · Room 204'}</p>
                </div>
                <span className="status-badge confirmed">On Duty</span>
              </div>
              <div className="details-grid">
                <section className="detail-panel">
                  <div className="detail-panel-heading">
                    <h2>Physician Details</h2>
                    <span>Active Staff</span>
                  </div>
                  <dl className="details-list">
                    <div><dt>Doctor Name</dt><dd>{selectedDoctor?.name || 'Dr. Kumar'}</dd></div>
                    <div><dt>Department</dt><dd>{selectedDoctor?.department || 'Cardiology'}</dd></div>
                    <div><dt>Consultation Room</dt><dd>{selectedDoctor?.room || 'Main Wing · Room 204'}</dd></div>
                    <div><dt>Daily Shift</dt><dd>{selectedDoctor?.hours || '09:00 AM – 04:00 PM'}</dd></div>
                    <div><dt>Accepting New Patients</dt><dd>Yes · Available</dd></div>
                  </dl>
                </section>
                <section className="detail-panel">
                  <div className="detail-panel-heading">
                    <h2>Scheduled Visits Today</h2>
                    <span>{appointmentRecords.filter(a => a.doctor === (selectedDoctor?.name || 'Dr. Kumar')).length} Patients</span>
                  </div>
                  <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                    {appointmentRecords
                      .filter(a => a.doctor === (selectedDoctor?.name || 'Dr. Kumar'))
                      .map(apt => (
                        <div key={apt.id} className="today-flow-row" style={{ padding: '10px 14px' }}>
                          <div>
                            <strong>{apt.time} · {apt.patient}</strong>
                            <small>{apt.type} · ID: {apt.id}</small>
                          </div>
                          <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            </div>
          ) : activePage === 'Patient Profile' ? (
            <div className="details-content">
              <button className="back-button" type="button" onClick={() => setActivePage('Appointments')}>
                <span aria-hidden="true">←</span> Back to Appointments
              </button>
              <div className="details-title-row">
                <div>
                  <span className="appointment-id">{selectedPatient?.id || 'P001'}</span>
                  <h2>{selectedPatient?.name || 'Demo Patient'}</h2>
                  <p>Contact: {selectedPatient?.contact || 'demo.patient@example.test'}</p>
                </div>
                <span className="status-badge confirmed">Patient Record</span>
              </div>
              <div className="details-grid">
                <section className="detail-panel">
                  <div className="detail-panel-heading">
                    <h2>Patient Summary</h2>
                    <span>Hospital ID: {selectedPatient?.id || 'P001'}</span>
                  </div>
                  <dl className="details-list">
                    <div><dt>Full Name</dt><dd>{selectedPatient?.name || 'Demo Patient'}</dd></div>
                    <div><dt>Contact Email</dt><dd>{selectedPatient?.contact || 'demo.patient@example.test'}</dd></div>
                    <div><dt>Registration Date</dt><dd>{selectedPatient?.joined || '2026-08-12'}</dd></div>
                    <div><dt>Status</dt><dd>Active Registered Patient</dd></div>
                  </dl>
                </section>
                <section className="detail-panel">
                  <div className="detail-panel-heading">
                    <h2>Patient Appointments</h2>
                    <span>{appointmentRecords.filter(a => a.patient === (selectedPatient?.name || 'Demo Patient') || a.patientId === selectedPatient?.id).length} records</span>
                  </div>
                  <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                    {appointmentRecords
                      .filter(a => a.patient === (selectedPatient?.name || 'Demo Patient') || a.patientId === selectedPatient?.id)
                      .map(apt => (
                        <div key={apt.id} className="today-flow-row" style={{ padding: '10px 14px' }}>
                          <div>
                            <strong>{apt.date} · {apt.time} · {apt.doctor}</strong>
                            <small>{apt.department} · {apt.type}</small>
                          </div>
                          <span className={`status-badge ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="placeholder-panel">
              <div className="placeholder-icon" aria-hidden="true">+</div>
              <h2>{activePage} is ready</h2>
              <p>The {activePage.toLowerCase()} workspace will be built in the next development step.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
