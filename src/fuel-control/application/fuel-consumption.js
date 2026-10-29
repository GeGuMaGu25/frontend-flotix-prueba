import { FuelRecordApiRepository } from '../infrastructure/persistence/fuel-record-api.repository.js'
import { FuelRecord } from '../domain/model/entities/fuel-record.entity.js'
import { getFleetPreferences } from '@/platform/infrastructure/user-preferences.js'

/**
 * FuelConsumption — application layer, Fuel Control.
 * Implements RegisterFuelConsumption / RecordFuelExpense (AV1 §4.6.1)
 * and the anomalous-consumption business rule: if a vehicle's efficiency
 * (km/L between two consecutive refuels) falls significantly below its
 * own historical average, the record is flagged as "Consumo anómalo".
 * The drop threshold is read from Settings → Flota (fuelAnomalyDropPct),
 * not hardcoded, so tuning it there changes detection immediately.
 */

export class FuelConsumption {
  constructor() {
    this.repository = new FuelRecordApiRepository()
  }

  listRecords() {
    return this.repository.getAll()
  }

  registerFuelConsumption(payload) {
    const record = new FuelRecord(payload)
    return this.repository.add(record)
  }

  removeRecord(id) {
    return this.repository.remove(id)
  }

  /**
   * Computes km/L efficiency per record for a given vehicle, ordered by mileage.
   * Works over already-fetched records so presentation code can call it synchronously.
   */
  efficiencyFor(vehicleId, allRecords) {
    const records = allRecords
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => a.mileageAtRefuel - b.mileageAtRefuel)

    return records.map((r, idx) => {
      if (idx === 0) return { ...r, kmPerLiter: null, anomalous: false }
      const prev = records[idx - 1]
      const kmDelta = r.mileageAtRefuel - prev.mileageAtRefuel
      const kmPerLiter = r.liters > 0 ? +(kmDelta / r.liters).toFixed(2) : null
      return { ...r, kmPerLiter, anomalous: false }
    }).map((r, idx, all) => {
      if (r.kmPerLiter === null) return r
      const history = all.slice(0, idx).map((x) => x.kmPerLiter).filter((v) => v !== null)
      const avg = history.length ? history.reduce((a, b) => a + b, 0) / history.length : r.kmPerLiter
      const threshold = 1 - (getFleetPreferences().fuelAnomalyDropPct / 100)
      const anomalous = history.length > 0 && r.kmPerLiter < avg * threshold
      return { ...r, anomalous }
    })
  }

  async allRecordsWithEfficiency() {
    const records = await this.repository.getAll()
    const byVehicle = {}
    for (const r of records) {
      byVehicle[r.vehicleId] = byVehicle[r.vehicleId] || true
    }
    return Object.keys(byVehicle).flatMap((vehicleId) => this.efficiencyFor(vehicleId, records))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}

export const fuelControlService = new FuelConsumption()
