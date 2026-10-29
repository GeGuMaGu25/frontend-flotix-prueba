import { BaseApiRepository, emptyToNull } from '@/shared/infrastructure/base-api-repository.js'
import { Vehicle } from '../../domain/model/entities/vehicle.entity.js'

/** VehicleApiRepository — infrastructure layer, Vehicle & Fleet Management (/vehicles). */
export class VehicleApiRepository extends BaseApiRepository {
  constructor() {
    super('/vehicles')
  }

  toEntity(resource) {
    return new Vehicle({
      id: resource.id,
      ownerId: resource.ownerId,
      driverId: resource.driverId ?? null,
      plate: resource.licensePlate,
      vehicleType: resource.vehicleType,
      currentMileage: Number(resource.currentMileage),
      status: resource.status
    })
  }

  toResource(vehicle) {
    return {
      ownerId: vehicle.ownerId,
      driverId: emptyToNull(vehicle.driverId),
      licensePlate: vehicle.plate,
      vehicleType: vehicle.vehicleType,
      currentMileage: Number(vehicle.currentMileage),
      status: vehicle.status
    }
  }
}
