import { IncidentApiRepository } from '../infrastructure/persistence/incident-api.repository.js'
import { Incident } from '../domain/model/entities/incident.entity.js'
import { IncidentStatus } from '../domain/model/value-objects/incident-status.js'
import { alertsService } from '@/alerts/application/alerts.service.js'
import { fleetService } from '@/fleet-management/application/fleet-management.js'

/**
 * IncidentReporting — application layer, Incident Management.
 * Implements ReportVehicleIncident, InspectIncident and ResolveIncident
 * (AV1 §4.6.1). Reporting an incident triggers an automatic critical
 * notification towards administrators via the Alerts & Notifications
 * bounded context (SendNotification), as described in the report.
 */
export class IncidentReporting {
  constructor() {
    this.repository = new IncidentApiRepository()
  }

  listIncidents() {
    return this.repository.getAll()
  }

  async reportVehicleIncident(payload) {
    const incident = await this.repository.add(new Incident(payload))
    const vehicle = await fleetService.getVehicle(incident.vehicleId)
    await alertsService.sendNotification({
      userId: vehicle.ownerId,
      type: 'incidents',
      message: `Nueva incidencia reportada: ${incident.description}`
    })
    return incident
  }

  inspectIncident(id) {
    return this.repository.update(id, { status: IncidentStatus.IN_REVIEW })
  }

  resolveIncident(id) {
    return this.repository.update(id, { status: IncidentStatus.RESOLVED })
  }

  removeIncident(id) {
    return this.repository.remove(id)
  }
}

export const incidentService = new IncidentReporting()
