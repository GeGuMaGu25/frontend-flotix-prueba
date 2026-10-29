import { UserApiRepository } from '../infrastructure/persistence/user-api.repository.js'
import { User } from '../domain/model/entities/user.entity.js'
import { Session } from '@/shared/infrastructure/session.js'

/**
 * UserAuthentication — application layer, Identity, Profiles & Security.
 * Orchestrates RegisterUser and AuthenticateUser use cases described
 * in AV1 §4.6.1 (Design-Level EventStorming).
 */
export class UserAuthentication {
  constructor() {
    this.repository = new UserApiRepository()
  }

  /** RegisterUser: signs up through the API, then opens the session with the same credentials. */
  async registerUser(payload) {
    // Validates the Driver license business rule before calling the API.
    new User({ ...payload, passwordHash: payload.password })
    await this.repository.signUp(payload)
    return this.authenticateUser(payload.email, payload.password)
  }

  /** AuthenticateUser: signs in, then loads the full profile for the session. */
  async authenticateUser(email, password) {
    const { token, user: authenticated } = await this.repository.signIn(email, password)
    Session.set({ ...authenticated, token })
    const user = await this.repository.getById(authenticated.id)
    Session.set({ ...user, token })
    return user
  }

  async updateProfile(id, patch) {
    const user = await this.repository.update(id, patch)
    Session.set({ ...user, token: Session.get()?.token })
    return user
  }

  listUsers() {
    return this.repository.getAll()
  }

  logout() {
    Session.clear()
  }

  currentUser() {
    return Session.get()
  }
}

export const identityService = new UserAuthentication()
