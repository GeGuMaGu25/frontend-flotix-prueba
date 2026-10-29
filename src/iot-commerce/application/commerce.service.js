import { IoTOrderApiRepository } from '../infrastructure/persistence/iot-order-api.repository.js'
import { IoTOrder } from '../domain/model/entities/iot-order.entity.js'
import { IoTCatalog, OrderStatus } from '../domain/model/value-objects/order-status.js'

/**
 * CommerceService — application layer, Digital Experience / IoT Commerce.
 * Implements PurchaseIoTDevice, ProcessPayment and UpdateOrderStatus
 * (AV1 §4.6.1). ProcessPayment is simulated locally (no real Payment
 * Gateway integration in this frontend-only build) but always succeeds
 * and immediately applies the "confirmed payment" business rule.
 */
export class CommerceService {
  constructor() {
    this.repository = new IoTOrderApiRepository()
  }

  get catalog() {
    return IoTCatalog
  }

  listOrders() {
    return this.repository.getAll()
  }

  async purchaseIoTDevice({ ownerId, sku, deviceQuantity }) {
    const product = IoTCatalog.find((p) => p.sku === sku)
    const order = new IoTOrder({
      ownerId,
      sku,
      deviceQuantity,
      totalAmount: product.unitPrice * Number(deviceQuantity),
      status: OrderStatus.PENDING_PAYMENT
    })
    const created = await this.repository.add(order)
    return { ...(await this.processPayment(created.id)), sku }
  }

  /** ProcessPayment: on success, auto-transitions the order to "En preparación". */
  processPayment(orderId) {
    return this.repository.updateStatus(orderId, OrderStatus.IN_PREPARATION)
  }

  updateOrderStatus(orderId, status) {
    return this.repository.updateStatus(orderId, status)
  }
}

export const commerceService = new CommerceService()
