import { BaseApiRepository, toDateOnly, emptyToNull } from '@/shared/infrastructure/base-api-repository.js'

/**
 * UserApiRepository — infrastructure layer, Identity, Profiles & Security.
 * Talks to /authentication (sign-up, sign-in) and /users of the Flotix
 * Platform API, translating roleType / licenseExpiration into the
 * frontend's role / licenseExpiry.
 */
export class UserApiRepository extends BaseApiRepository {
  constructor() {
    super('/users')
  }

  toEntity(resource) {
    return {
      id: resource.id,
      name: resource.name,
      email: resource.email,
      role: resource.roleType,
      licenseNumber: resource.licenseNumber ?? null,
      licenseExpiry: resource.licenseExpiration ?? null,
      companyName: resource.companyName ?? null,
      workshopName: resource.workshopName ?? null
    }
  }

  toResource(user) {
    return {
      name: user.name,
      licenseNumber: emptyToNull(user.licenseNumber),
      licenseExpiration: toDateOnly(user.licenseExpiry),
      companyName: emptyToNull(user.companyName),
      workshopName: emptyToNull(user.workshopName)
    }
  }

  findByRole(role) {
    return this.getAll({ roleType: role })
  }

  async signUp(payload) {
    const { data } = await this.http.post('/authentication/sign-up', {
      ...this.toResource(payload),
      email: payload.email,
      password: payload.password,
      roleType: payload.role
    })
    return this.toEntity(data)
  }

  /** Returns the authenticated user ({ id, email, role, name }) and its bearer token. */
  async signIn(email, password) {
    const { data } = await this.http.post('/authentication/sign-in', { email, password })
    return { user: this.toEntity(data), token: data.token }
  }
}
