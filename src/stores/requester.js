import { defineStore } from 'pinia'
import { useUserStore } from './user'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const useRequesterStore = defineStore('requester', () => {
  const userStore = useUserStore()

  // ===== HEADERS =====
function getHeaders(withAuth = false) {
  const headers = { 'Content-Type': 'application/json' }
  
  if (withAuth) {
    // 👇 Leer el token del localStorage (no del store)
    const stored = JSON.parse(localStorage.getItem('ekiAppUser') || '{}')
    const token = stored?.token
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  return headers
}

  // ===== REQUEST BASE =====
  async function request({
    method,
    route,
    withAuth = false,
    body = null,
    query = null,
    isFormData = false,
    retry = true
  }) {
    // Construir URL con query params
    let url = `${API_URL}${route}`
    if (query) {
      const params = new URLSearchParams(query)
      url += `?${params.toString()}`
    }

    const options = {
      method,
      headers: getHeaders(withAuth) // 👈 withAuth se pasa aquí
    }

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)

      // 401: intentar refresh token
      if (response.status === 401) {
  // 👇 No borrar el token si es control remoto (para no perder la sesión)
  if (!window.location.pathname.includes('/control/')) {
    userStore.setApiUser(null)
  }
}

      // Otros errores
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          status: response.status,
          data: errorData,
          error: errorData.error || errorData.message || `HTTP ${response.status}`
        }
      }

      const data = await response.json()
      return { status: response.status, data }

    } catch (e) {
      console.error(`[Requester] ${method} ${route}:`, e)
      return { status: 0, data: null, error: e.message }
    }
  }

  // ===== REFRESH TOKEN =====
  async function refreshToken() {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: userStore.tokens.refreshToken })
      })
      if (!res.ok) return false
      const { token, refreshToken: newRefresh } = await res.json()
      userStore.setApiUser({
        ...userStore.apiUser,
        token,
        refreshToken: newRefresh
      })
      return true
    } catch (e) {
      console.error('[Requester] Refresh token failed:', e)
      return false
    }
  }

  // ===== MÉTODOS =====
  const Get    = (opts) => request({ method: 'GET',    ...opts })
  const Post   = (opts) => request({ method: 'POST',   ...opts })
  const Put    = (opts) => request({ method: 'PUT',    ...opts })
  const Patch  = (opts) => request({ method: 'PATCH',  ...opts })
  const Delete = (opts) => request({ method: 'DELETE', ...opts })

  return { Get, Post, Put, Patch, Delete, request, refreshToken }
})