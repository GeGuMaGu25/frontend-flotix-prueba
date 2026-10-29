import { defineStore } from 'pinia'
import { fleetService } from '../../application/fleet-management.js'
import { identityService } from '@/identity-access/application/user-authentication.js'
import { UserRole } from '@/identity-access/domain/model/value-objects/user-role.js'

/** Pinia store — Vehicle & Fleet Management. Wraps FleetManagement. */
export const useFleetStore = defineStore('fleet', {
  state: () => ({
    vehicles: [],
    drivers: []
  }),
  getters: {
    driverName: (state) => (id) => state.drivers.find((d) => d.id === id)?.name ?? null,
    byId: (state) => (id) => state.vehicles.find((v) => v.id === id) ?? null
  },
  actions: {
    async refresh() {
      const [vehicles, users] = await Promise.all([fleetService.listVehicles(), identityService.listUsers()])
      this.vehicles = vehicles
      this.drivers = users.filter((u) => u.role === UserRole.DRIVER)
    },
    async registerVehicle(payload) {
      await fleetService.registerVehicle(payload)
      await this.refresh()
    },
    async updateVehicleInfo(id, payload) {
      await fleetService.updateVehicleInfo(id, payload)
      await this.refresh()
    },
    async removeVehicle(id) {
      await fleetService.removeVehicle(id)
      await this.refresh()
    }
  }
})
