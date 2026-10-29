import { MaintenanceRequestApiRepository } from '../infrastructure/persistence/maintenance-request-api.repository.js'
import { MaintenanceRequest } from '../domain/model/entities/maintenance-request.entity.js'
import { MaintenanceStatus } from '../domain/model/value-objects/maintenance-status.js'
import { fleetService } from '@/fleet-management/application/fleet-management.js'

/**
 * MaintenanceCoordination — application layer, Maintenance Management.
 * Orchestrates the full request lifecycle and enforces the automatic
 * cross-context business rule from AV1 §4.6.1: entering "En reparación"
 * flips the related vehicle to "En mantenimiento" in Vehicle & Fleet
 * Management, and completion returns it to "Disponible".
 */
export class MaintenanceCoordination {
  constructor() {
    this.repository = new MaintenanceRequestApiRepository()
  }

  listRequests() {
    return this.repository.getAll()
  }

  submitMaintenanceRequest(payload) {
    const request = new MaintenanceRequest(payload)
    return this.repository.add(request)
  }

  /** The API assigns the request's workshop at submission, so only the quote amount is sent here. */
  registerDiagnosticAndQuote(id, { estimatedCost }) {
    return this.repository.registerDiagnosticAndQuote(id, estimatedCost)
  }

  approveOrRejectBudget(id, approved) {
    return this.repository.approveOrRejectBudget(id, approved)
  }

  async updateRepairStatus(id, status) {
    if (status !== MaintenanceStatus.IN_REPAIR) return null
    const updated = await this.repository.startRepair(id)
    await fleetService.markInMaintenance(updated.vehicleId)
    return updated
  }

  async completeMaintenance(id) {
    const updated = await this.repository.complete(id)
    await fleetService.markAvailable(updated.vehicleId)
    return updated
  }

  removeRequest(id) {
    return this.repository.remove(id)
  }
}

export const maintenanceService = new MaintenanceCoordination()
