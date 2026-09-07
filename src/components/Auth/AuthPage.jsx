import { useState } from 'react'
import { registerUser, loginUser } from '../../services/api'
import './AuthPage.css'

export default function AuthPage({ onLogin, registeredPatients = [], onRegisterNewPatient }) {
  const [role, setRole] = useState('patient') // 'patient' | 'admin'
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sign In Form state
  const [signInData, setSignInData] = useState({
    identifier: '', // email or patient ID
    password: '',
    rememberMe: true,
  })

  // Patient Sign Up Form state
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Other',
    password: '',
    confirmPassword: '',
  })

  // Handle Sign In submission
  const handleSignIn = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!signInData.identifier.trim()) {
      setErrorMessage('Please enter your email or ID.')
      return
    }
    if (!signInData.password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsSubmitting(true)

    // Attempt Backend API authentication first
    try {
      const serverUser = await loginUser({
        identifier: signInData.identifier.trim(),
        password: signInData.password,
      })
      if (serverUser && serverUser.id) {
        setIsSubmitting(false)
        onLogin(serverUser)
        return
      }
    } catch {
      // If server returns credentials error or is offline, fallback to client matching
    }

    setIsSubmitting(false)

    if (role === 'admin') {
      // Admin Login
      const adminUser = {
        id: 'ADM-01',
        name: 'Dr. Sarah Jenkins',
        email: signInData.identifier.includes('@') ? signInData.identifier : 'admin@carepilot.hospital',
        role: 'admin',
        title: 'Hospital Administrator',
        department: 'Executive Medical Staff',
      }
      onLogin(adminUser)
    } else {
      // Patient Login
      const query = signInData.identifier.trim().toLowerCase()
      // Check if matches known patient
      const foundPatient = registeredPatients.find(
        (p) => p.id.toLowerCase() === query || (p.contact && p.contact.toLowerCase() === query) || p.name.toLowerCase() === query
      )

      if (foundPatient) {
        onLogin({
          id: foundPatient.id,
          name: foundPatient.name,
          email: foundPatient.contact,
          role: 'patient',
          phone: foundPatient.phone || '+1 (555) 234-5678',
        })
      } else {
        // Log in with entered info as patient
        onLogin({
          id: query.startsWith('p') ? query.toUpperCase() : 'P001',
          name: signInData.identifier.includes('@') ? signInData.identifier.split('@')[0] : signInData.identifier,
          email: signInData.identifier.includes('@') ? signInData.identifier : `${query}@example.test`,
          role: 'patient',
          phone: '+1 (555) 019-2831',
        })
      }
    }
  }

  // Handle Patient Sign Up submission
  const handleSignUp = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!signUpData.fullName.trim() || !signUpData.email.trim()) {
      setErrorMessage('Please fill in your name and email address.')
      return
    }
    if (!signUpData.password) {
      setErrorMessage('Please create a password.')
      return
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const newId = `P${String(registeredPatients.length + 1).padStart(3, '0')}`
    const newPatient = {
      id: newId,
      name: signUpData.fullName.trim(),
      contact: signUpData.email.trim(),
      phone: signUpData.phone || '+1 (555) 987-6543',
      age: signUpData.age || '32',
      gender: signUpData.gender,
      joined: new Date().toISOString().split('T')[0],
      role: 'patient',
    }

    // Persist to Cloud Backend
    try {
      const serverPatient = await registerUser({
        fullName: signUpData.fullName.trim(),
        email: signUpData.email.trim(),
        password: signUpData.password,
        phone: signUpData.phone || '+1 (555) 987-6543',
        age: parseInt(signUpData.age, 10) || 30,
        gender: signUpData.gender || 'Other',
        role: 'patient',
      })
      if (serverPatient && serverPatient.id) {
        newPatient.id = serverPatient.id
        newPatient.name = serverPatient.name || newPatient.name
      }
    } catch {
      // Graceful fallback to client storage if offline
    }

    setIsSubmitting(false)

    if (onRegisterNewPatient) {
      onRegisterNewPatient(newPatient)
    }

    onLogin(newPatient)
  }

  // 1-Click Quick Demo Login
  const handleQuickDemoAdmin = () => {
    onLogin({
      id: 'ADM-01',
      name: 'Dr. Sarah Jenkins',
      email: 'admin@carepilot.hospital',
      role: 'admin',
      title: 'Hospital Administrator',
      department: 'Clinical Operations',
    })
  }

  const handleQuickDemoPatient = (patientObj) => {
    onLogin({
      id: patientObj.id,
      name: patientObj.name,
      email: patientObj.contact,
      role: 'patient',
      phone: '+1 (555) 345-6789',
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Visual/Brand Panel */}
        <div className="auth-sidebar">
          <div>
            <div className="auth-brand">
              <div className="auth-brand-mark">+</div>
              <div className="auth-brand-text">
                <strong>CarePilot</strong>
                <span>AI Clinical Operations</span>
              </div>
            </div>

            <div className="auth-hero-copy">
              <div className="auth-hero-badge">Next-Gen Healthcare</div>
              <h2>Intelligent Care Coordination &amp; Scheduling</h2>
              <p>
                Empowering hospital staff with AI no-show prediction and providing patients with seamless, real-time appointment booking.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">✦</div>
                  <div className="auth-feature-text">
                    <strong>Predictive AI No-Show Scoring</strong>
                    <span>Actionable risk mitigation and proactive reminders</span>
                  </div>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">≡</div>
                  <div className="auth-feature-text">
                    <strong>Dynamic Waitlist Engine</strong>
                    <span>Instantly backfill cancelled slots with priority patients</span>
                  </div>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">◷</div>
                  <div className="auth-feature-text">
                    <strong>Self-Service Patient Access</strong>
                    <span>24/7 online booking, confirmations, and reminders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-footer-status">
            <div className="auth-pulse"></div>
            <span>CarePilot System Online · HIPAA Compliant Demo</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          {/* Role Switcher Tabs */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab patient ${role === 'patient' ? 'active' : ''}`}
              onClick={() => {
                setRole('patient')
                setErrorMessage('')
              }}
            >
              <span>♙</span> Patient Portal
            </button>
            <button
              type="button"
              className={`role-tab admin ${role === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setRole('admin')
                setMode('signin')
                setErrorMessage('')
              }}
            >
              <span>✚</span> Hospital Staff / Admin
            </button>
          </div>

          <div className="auth-header-row">
            <h1>
              {role === 'patient'
                ? mode === 'signin'
                  ? 'Patient Sign In'
                  : 'New Patient Registration'
                : 'Hospital Staff Login'}
            </h1>
            <p>
              {role === 'patient'
                ? mode === 'signin'
                  ? 'Access your upcoming appointments, medical history, and waitlist status.'
                  : 'Create your patient account to book appointments and receive reminders.'
                : 'Sign in to access clinic schedules, patient flow, and AI risk insights.'}
            </p>
          </div>

          {/* Mode toggle for Patient (Sign In vs Register) */}
          {role === 'patient' && (
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signin')
                  setErrorMessage('')
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mode-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signup')
                  setErrorMessage('')
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="auth-error" role="alert">
              <span>!</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM (Patient or Admin) */}
          {mode === 'signin' ? (
            <form className="auth-form" onSubmit={handleSignIn} noValidate>
              <div className="input-group">
                <label>{role === 'patient' ? 'Email or Patient ID' : 'Staff Email / Username'}</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder={role === 'patient' ? 'e.g. P001 or demo.patient@example.test' : 'admin@carepilot.hospital'}
                    value={signInData.identifier}
                    onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁' : '👁‍🗨'}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label>
                  <input
                    type="checkbox"
                    checked={signInData.rememberMe}
                    onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => alert('For this demo, any password or the 1-Click buttons can be used.')}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${role === 'patient' ? 'patient-theme' : ''}`}
              >
                Sign In as {role === 'patient' ? 'Patient' : 'Administrator'} →
              </button>
            </form>
          ) : (
            /* PATIENT REGISTRATION (SIGN UP) FORM */
            <form className="auth-form" onSubmit={handleSignUp} noValidate>
              <div className="input-group">
                <label>Full Legal Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Vance"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉</span>
                    <input
                      type="email"
                      placeholder="patient@example.test"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="input-group">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 29"
                    min="1"
                    max="120"
                    value={signUpData.age}
                    onChange={(e) => setSignUpData({ ...signUpData, age: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Gender</label>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn patient-theme">
                Complete Registration &amp; Sign In →
              </button>
            </form>
          )}

          {/* Quick Demo 1-Click Access for convenient testing */}
          <div className="quick-demo-section">
            <div className="quick-demo-header">
              <span>Instant Demo Access</span>
              <small>No password required</small>
            </div>

            <div className="quick-demo-buttons">
              {role === 'admin' ? (
                <button
                  type="button"
                  className="demo-chip-btn"
                  onClick={handleQuickDemoAdmin}
                >
                  <div className="demo-chip-info">
                    <strong>Dr. Sarah Jenkins (Admin)</strong>
                    <span>Full Access · Clinic Schedules, Analytics &amp; AI Controls</span>
                  </div>
                  <span className="demo-chip-arrow">→</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleQuickDemoPatient({ id: 'P001', name: 'Demo Patient', contact: 'demo.patient@example.test' })}
                  >
                    <div className="demo-chip-info">
                      <strong>Demo Patient (P001)</strong>
                      <span>Upcoming visit with Dr. Kumar · Cardiology</span>
                    </div>
                    <span className="demo-chip-arrow">→</span>
                  </button>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => handleQuickDemoPatient({ id: 'P002', name: 'Demo Patient 2', contact: 'demo.patient2@example.test' })}
                  >
                    <div className="demo-chip-info">
                      <strong>Demo Patient 2 (P002)</strong>
                      <span>Follow-up visit with Dr. Mehta · Neurology</span>
                    </div>
                    <span className="demo-chip-arrow">→</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
