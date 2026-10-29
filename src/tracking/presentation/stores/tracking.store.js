import { defineStore } from 'pinia'
import { trackingService } from '../../application/tracking.service.js'

/** Pinia store — Real-Time Monitoring / Fleet Tracking. Wraps TrackingService. */
export const useTrackingStore = defineStore('tracking', {
  state: () => ({
    devices: [],
    latestByDevice: trackingService.latestTelemetryByDevice()
  }),
  actions: {
    async refresh() {
      this.devices = await trackingService.listDevices()
      this.latestByDevice = trackingService.latestTelemetryByDevice()
    },
    async connectIoTDevice(payload) {
      await trackingService.connectIoTDevice(payload)
      await this.refresh()
    },
    async receiveTelemetry(device) {
      const packet = await trackingService.receiveTelemetry(device)
      this.latestByDevice = trackingService.latestTelemetryByDevice()
      return packet
    }
  }
})
