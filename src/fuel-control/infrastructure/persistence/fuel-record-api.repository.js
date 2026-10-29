import { BaseApiRepository, toDateOnly } from '@/shared/infrastructure/base-api-repository.js'
import { FuelRecord } from '../../domain/model/entities/fuel-record.entity.js'

/** FuelRecordApiRepository — infrastructure layer, Fuel Control (/fuel-records). */
export class FuelRecordApiRepository extends BaseApiRepository {
  constructor() {
    super('/fuel-records')
  }

  toEntity(resource) {
    return new FuelRecord({
      id: resource.id,
      vehicleId: resource.vehicleId,
      driverId: resource.driverId,
      liters: resource.liters,
      totalCost: resource.cost,
      mileageAtRefuel: resource.mileageAtRefill,
      date: toDateOnly(resource.recordedDate)
    })
  }

  toResource(record) {
    return {
      vehicleId: record.vehicleId,
      driverId: record.driverId,
      liters: Number(record.liters),
      cost: Number(record.totalCost),
      mileageAtRefill: Number(record.mileageAtRefuel),
      recordedDate: new Date(`${toDateOnly(record.date)}T12:00:00`).toISOString()
    }
  }
}
