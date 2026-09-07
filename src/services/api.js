const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export function getAppointments() {
  return request('/appointments')
}

export function getAppointment(id) {
  return request(`/appointments/${id}`)
}

export function createAppointment(data) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function confirmAppointment(id) {
  return request(`/appointments/${id}/confirm`, { method: 'POST' })
}

export function cancelAppointment(id) {
  return request(`/appointments/${id}/cancel`, { method: 'POST' })
}

export function rescheduleAppointment(id, data) {
  return request(`/appointments/${id}/reschedule`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function checkInAppointment(id) {
  return request(`/appointments/${id}/check-in`, { method: 'POST' })
}

export function completeAppointment(id) {
  return request(`/appointments/${id}/complete`, { method: 'POST' })
}

export function markAppointmentNoShow(id) {
  return request(`/appointments/${id}/no-show`, { method: 'POST' })
}

export function getWaitlist() {
  return request('/waitlist')
}

export function getSchedule() {
  return request('/schedule')
}

export function getAvailableSlots() {
  return request('/available-slots')
}

export function getAnalytics() {
  return request('/analytics/summary')
}

export function getAnalyticsRisk() {
  return request('/analytics/risk')
}

export function getAnalyticsUtilization() {
  return request('/analytics/utilization')
}

export function getAnalyticsDepartments() {
  return request('/analytics/departments')
}

export function getDoctors() {
  return request('/doctors')
}

export function createDoctor(data) {
  return request('/doctors', { method: 'POST', body: JSON.stringify(data) })
}

export function getDepartments() {
  return request('/departments')
}

export function createDepartment(data) {
  return request('/departments', { method: 'POST', body: JSON.stringify(data) })
}

export function addToWaitlist(data) {
  return request('/waitlist', { method: 'POST', body: JSON.stringify(data) })
}

export function offerWaitlistSlot(id) {
  return request(`/waitlist/${id}/offer-slot`, { method: 'POST' })
}

export function acceptWaitlistSlot(id) {
  return request(`/waitlist/${id}/accept`, { method: 'POST' })
}

export function declineWaitlistSlot(id) {
  return request(`/waitlist/${id}/decline`, { method: 'POST' })
}

export function getNotifications() {
  return request('/notifications')
}

export function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PUT' })
}

export function getAuditLogs() {
  return request('/audit-logs')
}

export function predictNoShow(data) {
  return request('/predict-no-show', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function registerUser(data) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function loginUser(data) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getPatients() {
  return request('/auth/patients')
}

export function getUsers() {
  return request('/auth/users')
}
