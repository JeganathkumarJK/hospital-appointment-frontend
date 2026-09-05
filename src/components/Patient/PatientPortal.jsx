import { useState } from 'react'
import './PatientPortal.css'

export default function PatientPortal({
  patientUser,
  appointments = [],
  waitlist = [],
  doctors = [],
  onBookAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  onLogout,
  onSwitchToAdmin,
}) {
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({ date: '2026-09-04', time: '10:00 AM' })

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    department: 'Cardiology',
    doctor: 'Dr. Kumar',
    date: '2026-09-04',
    time: '10:00 AM',
    type: 'Consultation',
    notes: '',
  })

  // Filter appointments for this patient
  const myAppointments = appointments.filter(
    (apt) =>
      (apt.patientId && apt.patientId.toUpperCase() === patientUser.id.toUpperCase()) ||
      (apt.patient && apt.patient.toLowerCase() === patientUser.name.toLowerCase())
  )

  const upcomingAppointments = myAppointments.filter((apt) => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
  const pastAppointments = myAppointments.filter((apt) => apt.status === 'CANCELLED' || apt.status === 'COMPLETED')
  const myWaitlist = waitlist.filter(
    (item) =>
      (item.patientId && item.patientId.toUpperCase() === patientUser.id.toUpperCase()) ||
      (item.patient && item.patient.toLowerCase() === patientUser.name.toLowerCase())
  )

  const nextAppointment = upcomingAppointments[0] || null

  const handleQuickBookSpecialty = (dept, doc) => {
    setBookingForm({
      department: dept,
      doctor: doc,
      date: '2026-09-04',
      time: '10:00 AM',
      type: 'Consultation',
      notes: '',
    })
    setIsBookModalOpen(true)
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    onBookAppointment({
      patientId: patientUser.id,
      patient: patientUser.name,
      doctor: bookingForm.doctor,
      department: bookingForm.department,
      date: bookingForm.date,
      time: bookingForm.time,
      type: bookingForm.type,
      notes: bookingForm.notes,
    })

    setFeedbackMessage('🎉 Your appointment has been booked! Your clinic pass is ready below.')
    setIsBookModalOpen(false)
  }

  const handleConfirmAttendance = (aptId) => {
    onConfirmAppointment(aptId)
    setFeedbackMessage('✓ Thank you! Your attendance is confirmed. The clinical team has been notified.')
  }

  const handleCancelVisit = (aptId) => {
    if (confirm('Are you sure you want to cancel this visit? We will release the slot to other patients in need.')) {
      onCancelAppointment(aptId)
      setFeedbackMessage('Appointment cancelled. You can book a new one whenever you are ready.')
    }
  }

  const handleRescheduleSubmit = (e) => {
    e.preventDefault()
    onRescheduleAppointment(selectedAppointmentForReschedule.id, rescheduleData.date, rescheduleData.time)
    setIsRescheduleModalOpen(false)
    setSelectedAppointmentForReschedule(null)
    setFeedbackMessage('✓ Appointment rescheduled successfully. Your new clinic pass has been updated.')
  }

  const firstName = patientUser.name ? patientUser.name.split(' ')[0] : 'Patient'

  return (
    <div className="patient-portal-shell">
      {/* Friendly Top Header */}
      <header className="patient-header">
        <div className="patient-header-inner">
          <div className="patient-hospital-brand">
            <div className="patient-hospital-cross">+</div>
            <div className="patient-hospital-title">
              <h1>CarePilot Patient Center</h1>
              <span>Simple, Guided Hospital Care</span>
            </div>
          </div>

          <div className="patient-user-chip">
            <span className="patient-id-badge">
              👤 {patientUser.name} · {patientUser.id}
            </span>

            <button
              type="button"
              className="patient-admin-switch-btn"
              onClick={onSwitchToAdmin}
              title="Hospital operations & clinical admin overview"
            >
              Admin View ↗
            </button>

            <button
              type="button"
              className="patient-logout-btn"
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Patient Content */}
      <main className="patient-main">
        {/* Feedback Alert if an action was taken */}
        {feedbackMessage && (
          <div className="patient-toast" role="status">
            <span>{feedbackMessage}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage('')}
              style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Welcome & Clear CTA */}
        <section className="patient-hero-card">
          <div className="patient-hero-text">
            <h2>Welcome, {firstName}! What would you like to do?</h2>
            <p>
              View your upcoming doctor visit, confirm your attendance, or book an appointment with our specialist physicians in a few simple steps.
            </p>
          </div>

          <button
            type="button"
            className="patient-hero-cta"
            onClick={() => {
              setBookingForm({
                department: 'Cardiology',
                doctor: 'Dr. Kumar',
                date: '2026-09-04',
                time: '10:00 AM',
                type: 'Consultation',
                notes: '',
              })
              setIsBookModalOpen(true)
            }}
          >
            <span>+</span> Book an Appointment
          </button>
        </section>

        {/* SECTION 1: UPCOMING APPOINTMENT PASS */}
        <div className="patient-section-header">
          <h3>
            <span>🎫</span> Your Upcoming Clinic Pass
          </h3>
          <span>Keep this information handy for your visit</span>
        </div>

        {nextAppointment ? (
          <div className="clinic-pass-ticket">
            <div className="pass-header-strip">
              <div className="pass-tag">
                <span>●</span> {nextAppointment.status === 'CONFIRMED' ? 'Confirmed Appointment' : 'Pending Confirmation'}
              </div>
              <div className="pass-ref-number">
                Clinic Pass: <strong>#{nextAppointment.id}</strong>
              </div>
            </div>

            <div className="pass-main-content">
              {/* Date & Time block */}
              <div className="pass-date-time">
                <div className="pass-date-label">Appointment Date</div>
                <div className="pass-date-day">{nextAppointment.date}</div>
                <div className="pass-time-slot">⏰ {nextAppointment.time}</div>
              </div>

              {/* Doctor and Clinic details */}
              <div className="pass-doctor-info">
                <h4>{nextAppointment.doctor}</h4>
                <div className="pass-doctor-dept">
                  Department of <strong>{nextAppointment.department}</strong> · {nextAppointment.type}
                </div>
                <div className="pass-location-tag">
                  📍 Main Hospital Wing · 2nd Floor · Room 204
                </div>
              </div>

              {/* Patient action buttons */}
              <div className="pass-actions-column">
                {nextAppointment.status === 'PENDING' ? (
                  <button
                    type="button"
                    className="pass-btn-confirm"
                    onClick={() => handleConfirmAttendance(nextAppointment.id)}
                  >
                    ✓ I Will Attend (Confirm)
                  </button>
                ) : (
                  <div
                    style={{
                      background: '#e7f5f2',
                      color: '#156155',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    ✓ Attendance Confirmed
                  </div>
                )}

                <button
                  type="button"
                  className="pass-btn-reschedule"
                  onClick={() => {
                    setSelectedAppointmentForReschedule(nextAppointment)
                    setRescheduleData({ date: nextAppointment.date, time: nextAppointment.time })
                    setIsRescheduleModalOpen(true)
                  }}
                >
                  ◷ Change Date / Time
                </button>

                <button
                  type="button"
                  className="pass-btn-cancel"
                  onClick={() => handleCancelVisit(nextAppointment.id)}
                >
                  Cancel Visit
                </button>
              </div>
            </div>

            {/* Visit Journey Progress Tracker */}
            <div className="pass-tracker-strip">
              <div className="tracker-title">Your Visit Journey</div>
              <div className="tracker-steps">
                <div className="tracker-line"></div>

                <div className="tracker-step done">
                  <div className="tracker-step-circle">✓</div>
                  <span className="tracker-step-label">1. Booked</span>
                </div>

                <div className={`tracker-step ${nextAppointment.status === 'CONFIRMED' ? 'done' : 'current'}`}>
                  <div className="tracker-step-circle">
                    {nextAppointment.status === 'CONFIRMED' ? '✓' : '2'}
                  </div>
                  <span className="tracker-step-label">
                    {nextAppointment.status === 'CONFIRMED' ? '2. Confirmed' : '2. Please Confirm'}
                  </span>
                </div>

                <div className="tracker-step">
                  <div className="tracker-step-circle">3</div>
                  <span className="tracker-step-label">3. Arrive at Clinic</span>
                </div>

                <div className="tracker-step">
                  <div className="tracker-step-circle">4</div>
                  <span className="tracker-step-label">4. Meet Doctor</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-appointment-box">
            <h4>You currently have no scheduled appointments</h4>
            <p>Ready to consult with a doctor? Click below to pick a specialist and book your visit.</p>
            <button
              type="button"
              className="patient-hero-cta"
              style={{ margin: '0 auto' }}
              onClick={() => setIsBookModalOpen(true)}
            >
              + Schedule a Visit Now
            </button>
          </div>
        )}

        {/* SECTION 2: CHOOSE BY WHAT YOU FEEL (SYMPTOM / SPECIALTY HELPER) */}
        <div className="patient-section-header">
          <h3>
            <span>💡</span> Need to see a doctor? Choose by what you feel
          </h3>
          <span>Click any card to instantly pick a specialist</span>
        </div>

        <div className="care-finder-grid">
          <button
            type="button"
            className="care-card-btn"
            onClick={() => handleQuickBookSpecialty('Cardiology', 'Dr. Kumar')}
          >
            <span className="care-card-icon">❤️</span>
            <strong>Heart &amp; Blood Pressure</strong>
            <span>Chest tightness, palpitations, high BP, shortness of breath</span>
            <div className="care-card-doc">Book Dr. Kumar (Cardiology) →</div>
          </button>

          <button
            type="button"
            className="care-card-btn"
            onClick={() => handleQuickBookSpecialty('Neurology', 'Dr. Mehta')}
          >
            <span className="care-card-icon">🧠</span>
            <strong>Headaches, Nerves &amp; Sleep</strong>
            <span>Chronic migraines, dizziness, numbness, memory or sleep issues</span>
            <div className="care-card-doc">Book Dr. Mehta (Neurology) →</div>
          </button>

          <button
            type="button"
            className="care-card-btn"
            onClick={() => handleQuickBookSpecialty('Pediatrics', 'Dr. Shah')}
          >
            <span className="care-card-icon">🧸</span>
            <strong>Kids &amp; Infant Healthcare</strong>
            <span>Child fever, growth checkups, vaccinations, pediatric care</span>
            <div className="care-card-doc">Book Dr. Shah (Pediatrics) →</div>
          </button>

          <button
            type="button"
            className="care-card-btn"
            onClick={() => handleQuickBookSpecialty('Orthopedics', 'Dr. Rao')}
          >
            <span className="care-card-icon">🦴</span>
            <strong>Bones, Joints &amp; Back Pain</strong>
            <span>Knee or back pain, sports injury, bone fractures, arthritis</span>
            <div className="care-card-doc">Book Dr. Rao (Orthopedics) →</div>
          </button>
        </div>

        {/* SECTION 3: STANDBY & WAITLIST EXPLAINED IN PLAIN ENGLISH */}
        <div className="standby-card">
          <div className="standby-card-header">
            <h4>
              <span>📋</span> Standby &amp; Waitlist Support
            </h4>
            <span className="standby-pill">
              {myWaitlist.length > 0 ? `${myWaitlist.length} Active Standby Ticket` : 'System Ready'}
            </span>
          </div>
          <p>
            <strong>How does Standby work?</strong> When a doctor's schedule is full, you can be placed on our automated standby list. If another patient cancels or reschedules, CarePilot immediately notifies you to take their slot so you don't have to wait weeks.
          </p>

          {myWaitlist.length > 0 ? (
            <div style={{ background: 'white', padding: '14px 18px', borderRadius: 8, border: '1px solid #cce0eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Standby Ticket #{myWaitlist[0].id}</strong>: Requested <strong>{myWaitlist[0].doctor}</strong> ({myWaitlist[0].department})
                  <div style={{ fontSize: 12, color: '#5b7588', marginTop: 3 }}>
                    Preferred: {myWaitlist[0].date} at {myWaitlist[0].time}
                  </div>
                </div>
                <span className="risk-badge low">We will notify you if a slot opens</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#577284' }}>
              You are not currently on a standby list. All your current appointments are confirmed.
            </div>
          )}
        </div>

        {/* SECTION 4: PREVIOUS VISITS */}
        {pastAppointments.length > 0 && (
          <>
            <div className="patient-section-header">
              <h3>
                <span>📁</span> Previous Visit History
              </h3>
              <span>{pastAppointments.length} past visits recorded</span>
            </div>

            <div className="history-card-list">
              {pastAppointments.map((apt) => (
                <div className="history-item-row" key={apt.id}>
                  <div className="history-item-left">
                    <span className={`history-badge-dot ${apt.status.toLowerCase()}`}></span>
                    <div>
                      <strong>{apt.doctor} · {apt.department}</strong>
                      <span>{apt.date} at {apt.time} · {apt.type}</span>
                    </div>
                  </div>
                  <span className="history-status-tag">{apt.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SECTION 5: HELPFUL FAQS FOR THE PATIENT */}
        <div className="patient-section-header">
          <h3>
            <span>❓</span> Visiting the Hospital: What You Need to Know
          </h3>
          <span>Clear guidelines for your comfort and safety</span>
        </div>

        <div className="patient-faq-grid">
          <div className="patient-faq-box">
            <h5>📄 What should I bring?</h5>
            <p>
              Please bring a valid Government photo ID, your insurance card (if applicable), and any previous medical test reports or current prescriptions.
            </p>
          </div>

          <div className="patient-faq-box">
            <h5>⏰ When should I arrive?</h5>
            <p>
              We recommend arriving 15 minutes before your scheduled appointment time to complete check-in at the department reception.
            </p>
          </div>

          <div className="patient-faq-box">
            <h5>🔄 What if I am running late?</h5>
            <p>
              Please use the <strong>Change Date / Time</strong> button on your clinic pass as early as possible so our care team can adjust your doctor's queue.
            </p>
          </div>
        </div>
      </main>

      {/* STEP-BY-STEP GUIDED BOOKING WIZARD MODAL */}
      {isBookModalOpen && (
        <div className="wizard-overlay" role="presentation">
          <div className="wizard-modal" role="dialog" aria-modal="true">
            <div className="wizard-header">
              <h3>Schedule Your Doctor Visit</h3>
              <button
                type="button"
                className="wizard-close-btn"
                onClick={() => setIsBookModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="wizard-step-progress">
              <div className="wizard-progress-bar active">1. Specialty &amp; Doctor</div>
              <div className="wizard-progress-bar active">2. Date &amp; Time</div>
              <div className="wizard-progress-bar active">3. Confirm Pass</div>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="wizard-body">
                <div className="wizard-field-group">
                  <label>1. What department or medical specialty do you need?</label>
                  <select
                    value={bookingForm.department}
                    onChange={(e) => {
                      const dept = e.target.value
                      let doc = 'Dr. Kumar'
                      if (dept === 'Neurology') doc = 'Dr. Mehta'
                      if (dept === 'Pediatrics') doc = 'Dr. Shah'
                      if (dept === 'Orthopedics') doc = 'Dr. Rao'
                      setBookingForm({ ...bookingForm, department: dept, doctor: doc })
                    }}
                  >
                    <option value="Cardiology">Cardiology (Heart, Chest &amp; Blood Pressure)</option>
                    <option value="Neurology">Neurology (Brain, Nerves &amp; Headaches)</option>
                    <option value="Pediatrics">Pediatrics (Child Healthcare &amp; Vaccines)</option>
                    <option value="Orthopedics">Orthopedics (Bones, Joints &amp; Back)</option>
                  </select>
                </div>

                <div className="wizard-field-group">
                  <label>2. Select your doctor</label>
                  <select
                    value={bookingForm.doctor}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctor: e.target.value })}
                  >
                    {(doctors.length > 0 ? doctors : [
                      { id: 'D001', name: 'Dr. Kumar', specialization: 'Interventional Cardiology', department: 'Cardiology' },
                      { id: 'D002', name: 'Dr. Mehta', specialization: 'Clinical Neurology', department: 'Neurology' },
                      { id: 'D003', name: 'Dr. Shah', specialization: 'Pediatric Care', department: 'Pediatrics' },
                      { id: 'D004', name: 'Dr. Rao', specialization: 'Sports Orthopedics', department: 'Orthopedics' },
                    ]).map((doc) => (
                      <option key={doc.id || doc.name} value={doc.name}>
                        {doc.name} ({doc.specialization || doc.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="wizard-field-group">
                    <label>3. Select preferred date</label>
                    <input
                      type="date"
                      min="2026-09-04"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="wizard-field-group">
                    <label>4. Available time slot</label>
                    <select
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    >
                      <option value="09:00 AM">09:00 AM (Morning)</option>
                      <option value="10:00 AM">10:00 AM (Morning)</option>
                      <option value="11:30 AM">11:30 AM (Morning)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon)</option>
                      <option value="03:30 PM">03:30 PM (Afternoon)</option>
                    </select>
                  </div>
                </div>

                <div className="wizard-field-group">
                  <label>5. Type of consultation</label>
                  <select
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                  >
                    <option value="Consultation">Standard Consultation</option>
                    <option value="Follow-up">Follow-up on Previous Treatment</option>
                    <option value="New patient checkup">New Patient General Checkup</option>
                  </select>
                </div>

                <div className="wizard-field-group">
                  <label>6. Brief reason for visit (Optional)</label>
                  <textarea
                    placeholder="e.g. Follow-up after blood pressure medication, or knee stiffness for 3 days"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="wizard-footer">
                <button
                  type="button"
                  className="wizard-cancel-btn"
                  onClick={() => setIsBookModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="wizard-submit-btn">
                  Generate My Clinic Pass →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleModalOpen && selectedAppointmentForReschedule && (
        <div className="wizard-overlay" role="presentation">
          <div className="wizard-modal" role="dialog" aria-modal="true">
            <div className="wizard-header">
              <h3>Change Visit Date &amp; Time</h3>
              <button
                type="button"
                className="wizard-close-btn"
                onClick={() => setIsRescheduleModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="wizard-body">
                <p style={{ color: '#577284', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
                  Rescheduling your appointment with <strong>{selectedAppointmentForReschedule.doctor}</strong> ({selectedAppointmentForReschedule.department}).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="wizard-field-group">
                    <label>Choose New Date</label>
                    <input
                      type="date"
                      min="2026-09-04"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="wizard-field-group">
                    <label>Choose New Time Slot</label>
                    <select
                      value={rescheduleData.time}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="wizard-footer">
                <button
                  type="button"
                  className="wizard-cancel-btn"
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="wizard-submit-btn">
                  Update My Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
