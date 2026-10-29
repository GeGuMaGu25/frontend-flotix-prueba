import { defineStore } from 'pinia'
import { identityService } from '../../application/user-authentication.js'
import { UserRole } from '../../domain/model/value-objects/user-role.js'

/**
 * Pinia store — Identity, Profiles & Security. Thin reactive wrapper
 * around UserAuthentication (kept framework-agnostic in the application
 * layer); the store just mirrors its state for components to consume.
 * Also centralizes the read-only user directory (mechanics/workshops
 * lookups) so presentation code never reaches into the user repository
 * directly.
 */
export const useSessionStore = defineStore('session', {
  state: () => ({
    user: identityService.currentUser(),
    users: []
  }),
  getters: {
    isAuthenticated: (state) => !!state.user?.token,
    role: (state) => state.user?.role ?? null,
    mechanics: (state) => state.users.filter((u) => u.role === UserRole.MECHANIC),
    getUserById: (state) => (id) => state.users.find((u) => u.id === id) ?? null
  },
  actions: {
    async refresh() {
      this.users = await identityService.listUsers()
    },
    async login(email, password) {
      await identityService.authenticateUser(email, password)
      this.user = identityService.currentUser()
    },
    async register(payload) {
      await identityService.registerUser(payload)
      this.user = identityService.currentUser()
    },
    async updateProfile(patch) {
      await identityService.updateProfile(this.user.id, { ...this.user, ...patch })
      this.user = identityService.currentUser()
    },
    logout() {
      identityService.logout()
      this.user = null
    }
  }
})
