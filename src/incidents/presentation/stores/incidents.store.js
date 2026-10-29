import { defineStore } from 'pinia'
import { incidentService } from '../../application/incident-reporting.js'

/** Pinia store — Incident Management. Wraps IncidentReporting. */
export const useIncidentsStore = defineStore('incidents', {
  state: () => ({
    incidents: []
  }),
  actions: {
    async refresh() {
      this.incidents = await incidentService.listIncidents()
    },
    async reportVehicleIncident(payload) {
      await incidentService.reportVehicleIncident(payload)
      await this.refresh()
    },
    async inspectIncident(id) {
      await incidentService.inspectIncident(id)
      await this.refresh()
    },
    async resolveIncident(id) {
      await incidentService.resolveIncident(id)
      await this.refresh()
    },
    async removeIncident(id) {
      await incidentService.removeIncident(id)
      await this.refresh()
    }
  }
})
