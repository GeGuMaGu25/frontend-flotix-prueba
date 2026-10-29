import { BaseApiRepository } from '@/shared/infrastructure/base-api-repository.js'
import { Alert } from '../../domain/model/entities/alert.entity.js'

/** AlertApiRepository — infrastructure layer, Alerts & Notifications (/alerts). */
export class AlertApiRepository extends BaseApiRepository {
  constructor() {
    super('/alerts')
  }

  toEntity(resource) {
    return new Alert({
      id: resource.id,
      vehicleId: resource.vehicleId,
      alertType: resource.alertType,
      activatedAt: resource.triggerDate
    })
  }

  toResource(alert) {
    return {
      vehicleId: alert.vehicleId,
      alertType: alert.alertType
    }
  }
}
