import { BaseApiRepository } from '@/shared/infrastructure/base-api-repository.js'
import { Incident } from '../../domain/model/entities/incident.entity.js'

/** IncidentApiRepository — infrastructure layer, Incident Management (/incidents). */
export class IncidentApiRepository extends BaseApiRepository {
  constructor() {
    super('/incidents')
  }

  toEntity(resource) {
    return new Incident({
      id: resource.id,
      vehicleId: resource.vehicleId,
      driverId: resource.driverId,
      description: resource.description,
      status: resource.status,
      reportedAt: resource.reportedDate
    })
  }

  toResource(incident) {
    return {
      vehicleId: incident.vehicleId,
      driverId: incident.driverId,
      description: incident.description,
      status: incident.status
    }
  }
}
