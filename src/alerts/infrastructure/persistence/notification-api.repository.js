import { BaseApiRepository } from '@/shared/infrastructure/base-api-repository.js'
import { Notification } from '../../domain/model/entities/notification.entity.js'

/** NotificationApiRepository — infrastructure layer, Alerts & Notifications (/notifications). */
export class NotificationApiRepository extends BaseApiRepository {
  constructor() {
    super('/notifications')
  }

  toEntity(resource) {
    return new Notification({
      id: resource.id,
      userId: resource.userId,
      alertId: resource.alertId ?? null,
      message: resource.message,
      isRead: resource.isRead,
      sentAt: resource.sentDate
    })
  }

  toResource(notification) {
    return {
      userId: notification.userId,
      alertId: notification.alertId ?? null,
      message: notification.message
    }
  }

  async markAsRead(id) {
    const { data } = await this.http.put(`${this.resourcePath}/${id}`, { isRead: true })
    return this.toEntity(data)
  }
}
