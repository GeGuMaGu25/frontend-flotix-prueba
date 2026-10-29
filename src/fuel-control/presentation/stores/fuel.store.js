import { defineStore } from 'pinia'
import { fuelControlService } from '../../application/fuel-consumption.js'

/** Pinia store — Fuel Control. Wraps FuelConsumption. */
export const useFuelStore = defineStore('fuel', {
  state: () => ({
    records: []
  }),
  actions: {
    async refresh() {
      this.records = await fuelControlService.allRecordsWithEfficiency()
    },
    async registerFuelConsumption(payload) {
      await fuelControlService.registerFuelConsumption(payload)
      await this.refresh()
    },
    async removeRecord(id) {
      await fuelControlService.removeRecord(id)
      await this.refresh()
    },
    efficiencyFor(vehicleId) {
      return fuelControlService.efficiencyFor(vehicleId, this.records)
    }
  }
})
