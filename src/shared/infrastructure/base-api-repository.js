import { http } from './base-api.js'

/**
 * BaseApiRepository
 * Generic infrastructure-layer repository implementing the same CRUD
 * contract as LocalStorageRepository (getAll, getById, findBy, add,
 * update, remove) against a Flotix Platform API resource. Every method is
 * asynchronous. Subclasses translate between the API resources and the
 * frontend domain entities through toEntity / toResource (assemblers).
 */
export class BaseApiRepository {
  /**
   * @param {string} resourcePath - API endpoint relative to the base URL (e.g. '/vehicles')
   */
  constructor(resourcePath) {
    this.resourcePath = resourcePath
    this.http = http
  }

  /** Assembles a frontend entity from an API resource. */
  toEntity(resource) {
    return resource
  }

  /** Assembles the API request body from a frontend entity or patch. */
  toResource(entity) {
    return entity
  }

  async getAll(params = {}) {
    const { data } = await this.http.get(this.resourcePath, { params })
    return data.map((resource) => this.toEntity(resource))
  }

  async getById(id) {
    const { data } = await this.http.get(`${this.resourcePath}/${id}`)
    return this.toEntity(data)
  }

  async findBy(predicate, params = {}) {
    return (await this.getAll(params)).filter(predicate)
  }

  async add(entity) {
    const { data } = await this.http.post(this.resourcePath, this.toResource(entity))
    return this.toEntity(data)
  }

  /** PUT replaces the whole resource, so the patch is merged over the current state first. */
  async update(id, patch) {
    const current = await this.getById(id)
    const { data } = await this.http.put(`${this.resourcePath}/${id}`, this.toResource({ ...current, ...patch }))
    return this.toEntity(data)
  }

  async remove(id) {
    await this.http.delete(`${this.resourcePath}/${id}`)
  }
}

/** Formats a Date or ISO string as the API's DateOnly ("yyyy-MM-dd"); empty values become null. */
export function toDateOnly(value) {
  if (!value) return null
  if (value instanceof Date) {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
  }
  return String(value).slice(0, 10)
}

/** Converts an empty form value to null, as optional API fields expect. */
export function emptyToNull(value) {
  return value === '' || value === undefined ? null : value
}
