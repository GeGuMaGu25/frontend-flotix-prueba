import { BaseApiRepository } from '@/shared/infrastructure/base-api-repository.js'
import { MaintenanceRequest } from '../../domain/model/entities/maintenance-request.entity.js'

/**
 * MaintenanceRequestApiRepository — infrastructure layer, Maintenance Management
 * (/maintenance-requests). Status changes go through the API's lifecycle
 * endpoints instead of a generic PUT.
 */
export class MaintenanceRequestApiRepository extends BaseApiRepository {
  constructor() {
    super('/maintenance-requests')
  }

  toEntity(resource) {
    return new MaintenanceRequest({
      id: resource.id,
      createdAt: resource.requestDate,
      vehicleId: resource.vehicleId,
      mechanicId: resource.mechanicId,
      faultDescription: resource.description,
      estimatedCost: resource.estimatedCost,
      status: resource.status
    })
  }

  toResource(request) {
    return {
      vehicleId: request.vehicleId,
      mechanicId: request.mechanicId,
      description: request.faultDescription
    }
  }

  async _transition(id, action, body = {}) {
    const { data } = await this.http.post(`${this.resourcePath}/${id}/${action}`, body)
    return this.toEntity(data)
  }

  registerDiagnosticAndQuote(id, estimatedCost) {
    return this._transition(id, 'diagnostic-and-quote', { estimatedCost: Number(estimatedCost) })
  }

  approveOrRejectBudget(id, isApproved) {
    return this._transition(id, 'budget-decision', { isApproved })
  }

  startRepair(id) {
    return this._transition(id, 'repair-start')
  }

  complete(id) {
    return this._transition(id, 'completion')
  }
}
