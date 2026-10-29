import { IoTDeviceApiRepository } from '../infrastructure/persistence/iot-device-api.repository.js'
import { TelemetryDataRepository } from '../infrastructure/persistence/telemetry-data.repository.js'
import { TelemetryDataApiRepository } from '../infrastructure/persistence/telemetry-data-api.repository.js'
import { IoTDevice } from '../domain/model/entities/iot-device.entity.js'
import { TelemetryData } from '../domain/model/entities/telemetry-data.entity.js'
import { alertsService } from '@/alerts/application/alerts.service.js'
import { fleetService } from '@/fleet-management/application/fleet-management.js'

// Lima, Perú as the simulation's geographic center (AV1 targets Peruvian fleets).
const CENTER = { lat: -12.046, lng: -77.043 }

/**
 * TrackingService — application layer, Real-Time Monitoring / Fleet Tracking.
 * Implements ConnectIoTDevice, ReceiveTelemetry and UpdateVehicleLocation
 * (AV1 §4.6.1). ReceiveTelemetry also feeds the Alerts & Notifications
 * context by evaluating the speed-limit threshold on every packet.
 */
export class TrackingService {
  constructor() {
    this.deviceRepository = new IoTDeviceApiRepository()
    // Local rolling window that feeds the map; every packet is also sent to the API.
    this.telemetryRepository = new TelemetryDataRepository()
    this.telemetryApiRepository = new TelemetryDataApiRepository()
  }

  listDevices() {
    return this.deviceRepository.getAll()
  }

  connectIoTDevice(payload) {
    return this.deviceRepository.add(new IoTDevice(payload))
  }

  latestTelemetryByDevice() {
    const all = this.telemetryRepository.getAll()
    const latest = {}
    for (const t of all) {
      if (!latest[t.deviceId] || new Date(t.timestamp) > new Date(latest[t.deviceId].timestamp)) {
        latest[t.deviceId] = t
      }
    }
    return latest
  }

  /** ReceiveTelemetry: simulates one incoming GPS/speed packet for a device. */
  async receiveTelemetry(device) {
    const packet = new TelemetryData({
      deviceId: device.id,
      latitude: +(CENTER.lat + (Math.random() - 0.5) * 0.06).toFixed(5),
      longitude: +(CENTER.lng + (Math.random() - 0.5) * 0.06).toFixed(5),
      speed: Math.round(30 + Math.random() * 80)
    })
    const records = this.telemetryRepository.getAll()
    records.push(packet)
    this.telemetryRepository._writeAll(records.slice(-200)) // keep a rolling window
    await this.telemetryApiRepository.add(packet)

    const vehicle = (await fleetService.listVehicles()).find((v) => v.id === device.vehicleId)
    if (vehicle) await alertsService.evaluateSpeedLimit(vehicle, packet.speed)
    return packet
  }
}

export const trackingService = new TrackingService()
