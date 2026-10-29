import { ReportApiRepository } from '../infrastructure/persistence/report-api.repository.js'
import { Report } from '../domain/model/entities/report.entity.js'
import { fleetService } from '@/fleet-management/application/fleet-management.js'
import { fuelControlService } from '@/fuel-control/application/fuel-consumption.js'
import { maintenanceService } from '@/maintenance/application/maintenance-coordination.js'
import { MaintenanceStatus } from '@/maintenance/domain/model/value-objects/maintenance-status.js'

/**
 * AnalyticsService — application layer, Reporting & Analytics.
 * Implements ConsolidateFleetData, GeneratePerformanceReport and
 * ExportReportToPdf (AV1 §4.6.1), reading across every other bounded
 * context. Applies the filtering rule described in the report: vehicles
 * with fewer than two historical fuel records are excluded from the
 * performance comparison to avoid statistically meaningless averages.
 */
export class AnalyticsService {
  constructor() {
    this.repository = new ReportApiRepository()
  }

  /** ConsolidateFleetData */
  async consolidateFleetData() {
    const [vehicles, fuelRecords, maintenanceRequests] = await Promise.all([
      fleetService.listVehicles(),
      fuelControlService.listRecords(),
      maintenanceService.listRequests()
    ])

    return {
      totalVehicles: vehicles.length,
      totalFuelCost: fuelRecords.reduce((a, r) => a + r.totalCost, 0),
      totalMaintenanceCost: maintenanceRequests.reduce((a, r) => a + r.estimatedCost, 0),
      completedMaintenance: maintenanceRequests.filter((r) => r.status === MaintenanceStatus.COMPLETED).length
    }
  }

  /** GeneratePerformanceReport: per-vehicle fuel cost & efficiency comparison. */
  async generatePerformanceReport() {
    const [vehicles, fuelRecords] = await Promise.all([fleetService.listVehicles(), fuelControlService.listRecords()])

    return vehicles
      .map((v) => {
        const records = fuelRecords.filter((r) => r.vehicleId === v.id)
        const efficiencies = fuelControlService.efficiencyFor(v.id, fuelRecords).map((r) => r.kmPerLiter).filter((v) => v !== null)
        const avgEfficiency = efficiencies.length ? +(efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length).toFixed(2) : null
        return {
          vehicleId: v.id,
          plate: v.plate,
          recordCount: records.length,
          totalCost: records.reduce((a, r) => a + r.totalCost, 0),
          avgEfficiency
        }
      })
      // Business rule (AV1 §4.6.1): exclude vehicles with fewer than 2 historical fuel records
      .filter((row) => row.recordCount >= 2)
  }

  /**
   * ExportReportToPdf — the API generates and stores the report; the file
   * itself is still a local text export. filterParams carries the { from, to } period.
   */
  exportReportToPdf(ownerId, reportType, filterParams = {}) {
    return this.repository.add(new Report({ ownerId, reportType, filterParams }))
  }

  listReports() {
    return this.repository.getAll()
  }
}

export const analyticsService = new AnalyticsService()
