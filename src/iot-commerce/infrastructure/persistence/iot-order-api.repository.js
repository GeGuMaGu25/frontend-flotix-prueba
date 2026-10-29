import { BaseApiRepository, toDateOnly } from '@/shared/infrastructure/base-api-repository.js'
import { IoTOrder } from '../../domain/model/entities/iot-order.entity.js'

/**
 * IoTOrderApiRepository — infrastructure layer, Digital Experience / IoT
 * Commerce (/iot-orders). The API does not store the catalog SKU, so it is
 * only available on orders placed during the current session.
 */
export class IoTOrderApiRepository extends BaseApiRepository {
  constructor() {
    super('/iot-orders')
  }

  toEntity(resource) {
    return new IoTOrder({
      id: resource.id,
      ownerId: resource.ownerId,
      deviceQuantity: resource.quantity,
      totalAmount: resource.totalAmount,
      status: resource.status,
      orderDate: toDateOnly(resource.orderDate)
    })
  }

  toResource(order) {
    return {
      ownerId: order.ownerId,
      quantity: Number(order.deviceQuantity),
      totalAmount: Number(order.totalAmount)
    }
  }

  async updateStatus(id, status) {
    const { data } = await this.http.put(`${this.resourcePath}/${id}`, { status })
    return this.toEntity(data)
  }
}
