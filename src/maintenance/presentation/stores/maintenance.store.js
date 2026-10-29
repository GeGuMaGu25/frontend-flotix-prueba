import { defineStore } from 'pinia'
import { maintenanceService } from '../../application/maintenance-coordination.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'

/** Pinia store — Maintenance Management. Wraps MaintenanceCoordination. */
export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    requests: []
  }),
  getters: {
    byId: (state) => (id) => state.requests.find((r) => r.id === id) ?? null
  },
  actions: {
    async refresh() {
      this.requests = await maintenanceService.listRequests()
    },
    async submitMaintenanceRequest(payload) {
      const r = await maintenanceService.submitMaintenanceRequest(payload)
      await this.refresh()
      return r
    },
    async registerDiagnosticAndQuote(id, payload) {
      await maintenanceService.registerDiagnosticAndQuote(id, payload)
      await this.refresh()
    },
    async approveOrRejectBudget(id, approved) {
      await maintenanceService.approveOrRejectBudget(id, approved)
      await this.refresh()
    },
    async updateRepairStatus(id, status) {
      await maintenanceService.updateRepairStatus(id, status)
      // The vehicle status changes too (cross-context rule).
      await Promise.all([this.refresh(), useFleetStore().refresh()])
    },
    async completeMaintenance(id) {
      await maintenanceService.completeMaintenance(id)
      await Promise.all([this.refresh(), useFleetStore().refresh()])
    },
    async removeRequest(id) {
      await maintenanceService.removeRequest(id)
      await this.refresh()
    }
  }
})
