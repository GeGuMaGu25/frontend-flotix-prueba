import axios from 'axios'
import { Session } from './session.js'

/**
 * BaseApi
 * Shared HTTP client used by every API repository to reach the Flotix
 * Platform REST API (FlotixPlatform.API, C# / .NET + PostgreSQL).
 * The base URL comes from VITE_FLOTIX_API_URL (.env.development /
 * .env.production). When a session exists its bearer token is attached,
 * so enabling the backend's request authorization needs no frontend change.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_FLOTIX_API_URL ?? 'http://localhost:5080/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use((config) => {
  const token = Session.get()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// The API answers business errors with a localized plain-text body and model
// validation errors with RFC 7807 ProblemDetails; both become a plain Error
// so views can keep showing `e.message`.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data
    const validationMessage = data?.errors ? Object.values(data.errors).flat()[0] : null
    const message = typeof data === 'string' && data
      ? data
      : validationMessage ?? data?.detail ?? data?.title ?? error.message
    return Promise.reject(new Error(message))
  }
)
