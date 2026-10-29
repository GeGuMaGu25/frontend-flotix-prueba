import { VehicleApiRepository } from '../infrastructure/persistence/vehicle-api.repository.js'
import { Vehicle } from '../domain/model/entities/vehicle.entity.js'
import { VehicleStatus } from '../domain/model/value-objects/vehicle-status.js'

/**
 * FleetManagement — application layer, Vehicle & Fleet Management.
 * Implements RegisterVehicle, UpdateVehicleInfo, ChangeVehicleStatus
 * and AssignDriverToVehicle (AV1 §4.6.1).
 */
export class FleetManagement {
  constructor() {
    this.repository = new VehicleApiRepository()
  }

  listVehicles() {
    return this.repository.getAll()
  }

  getVehicle(id) {
    return this.repository.getById(id)
  }

  registerVehicle(payload) {
    const vehicle = new Vehicle(payload)
    return this.repository.add(vehicle)
  }

  updateVehicleInfo(id, patch) {
    return this.repository.update(id, patch)
  }

  assignDriverToVehicle(vehicleId, driverId) {
    return this.repository.update(vehicleId, { driverId })
  }

  changeVehicleStatus(vehicleId, status) {
    return this.repository.update(vehicleId, { status })
  }

  /** Cross-context reaction: called from Maintenance Management (UpdateRepairStatus). */
  markInMaintenance(vehicleId) {
    return this.changeVehicleStatus(vehicleId, VehicleStatus.IN_MAINTENANCE)
  }

  markAvailable(vehicleId) {
    return this.changeVehicleStatus(vehicleId, VehicleStatus.AVAILABLE)
  }

  removeVehicle(id) {
    return this.repository.remove(id)
  }
}

export const fleetService = new FleetManagement()
