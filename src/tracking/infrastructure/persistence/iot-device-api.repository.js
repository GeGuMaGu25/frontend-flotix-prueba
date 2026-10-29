import { BaseApiRepository } from '@/shared/infrastructure/base-api-repository.js'
import { IoTDevice } from '../../domain/model/entities/iot-device.entity.js'

const CONNECTED = 'Conectado'
const DISCONNECTED = 'Desconectado'

/** IoTDeviceApiRepository — infrastructure layer, Real-Time Monitoring / Fleet Tracking (/iot-devices). */
export class IoTDeviceApiRepository extends BaseApiRepository {
  constructor() {
    super('/iot-devices')
  }

  toEntity(resource) {
    return new IoTDevice({
      id: resource.id,
      vehicleId: resource.vehicleId,
      serialNumber: resource.serialNumber,
      connectionStatus: resource.isConnected ? CONNECTED : DISCONNECTED
    })
  }

  toResource(device) {
    return {
      vehicleId: device.vehicleId,
      serialNumber: device.serialNumber,
      isConnected: (device.connectionStatus ?? CONNECTED) === CONNECTED
    }
  }
}
