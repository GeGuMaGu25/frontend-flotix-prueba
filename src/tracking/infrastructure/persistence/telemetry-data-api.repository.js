import { BaseApiRepository } from '@/shared/infrastructure/base-api-repository.js'
import { TelemetryData } from '../../domain/model/entities/telemetry-data.entity.js'

/**
 * TelemetryDataApiRepository — infrastructure layer, Real-Time Monitoring /
 * Fleet Tracking (/telemetry-data). The API queues every packet for the
 * IoT Telemetry Processor and answers 202 Accepted with no body.
 */
export class TelemetryDataApiRepository extends BaseApiRepository {
  constructor() {
    super('/telemetry-data')
  }

  toEntity(resource) {
    return new TelemetryData({
      id: resource.id,
      deviceId: resource.deviceId,
      latitude: Number(resource.latitude),
      longitude: Number(resource.longitude),
      speed: Number(resource.speed),
      timestamp: resource.recordedAt
    })
  }

  toResource(packet) {
    return {
      deviceId: packet.deviceId,
      latitude: packet.latitude,
      longitude: packet.longitude,
      speed: packet.speed,
      recordedAt: packet.timestamp
    }
  }

  async add(packet) {
    await this.http.post(this.resourcePath, this.toResource(packet))
    return packet
  }
}
