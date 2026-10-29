import { defineStore } from 'pinia'
import { analyticsService } from '../../application/analytics.service.js'

/** Pinia store — Reporting & Analytics. Wraps AnalyticsService. */
export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    reports: [],
    summary: { totalVehicles: 0, totalFuelCost: 0, totalMaintenanceCost: 0, completedMaintenance: 0 },
    performance: []
  }),
  actions: {
    async refresh() {
      const [reports, summary, performance] = await Promise.all([
        analyticsService.listReports(),
        analyticsService.consolidateFleetData(),
        analyticsService.generatePerformanceReport()
      ])
      this.reports = reports
      this.summary = summary
      this.performance = performance
    },
    async exportReportToPdf(userId, title, params) {
      const report = await analyticsService.exportReportToPdf(userId, title, params)
      this.reports = await analyticsService.listReports()
      return report
    }
  }
})
