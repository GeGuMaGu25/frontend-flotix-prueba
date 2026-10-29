import { AlertApiRepository } from '../infrastructure/persistence/alert-api.repository.js'
import { NotificationApiRepository } from '../infrastructure/persistence/notification-api.repository.js'
import { Alert } from '../domain/model/entities/alert.entity.js'
import { Notification } from '../domain/model/entities/notification.entity.js'
import { getFleetPreferences, getNotificationPreferences } from '@/platform/infrastructure/user-preferences.js'

/**
 * AlertsService — application layer, Alerts & Notifications.
 * Implements EvaluateThresholds, MaintenanceAlertGenerated /
 * SpeedLimitExceededAlertGenerated, SendNotification and
 * MarkNotificationAsRead (AV1 §4.6.1). Also acts as the inbound
 * integration point other bounded contexts use to raise alerts
 * (Incident Management, Fuel Control, Real-Time Monitoring).
 * Thresholds and the per-type notification toggle both come from
 * Settings (Flota / Notificaciones) instead of hardcoded values.
 */
const MAINTENANCE_THRESHOLD_RATIO = 0.9 // 90% of the configured service interval

export class AlertsService {
  constructor() {
    this.alertRepository = new AlertApiRepository()
    this.notificationRepository = new NotificationApiRepository()
  }

  listAlerts() {
    return this.alertRepository.getAll()
  }

  listNotifications() {
    return this.notificationRepository.getAll()
  }

  generateAlert({ vehicleId, alertType }) {
    const alert = new Alert({ vehicleId, alertType })
    return this.alertRepository.add(alert)
  }

  /** SendNotification, gated by the recipient's per-type preference (Settings → Notificaciones). */
  async sendNotification({ userId, alertId = null, message, type = 'maintenance' }) {
    if (!getNotificationPreferences(userId)[type]) return null
    const notification = new Notification({ userId, alertId, message })
    return this.notificationRepository.add(notification)
  }

  markNotificationAsRead(id) {
    return this.notificationRepository.markAsRead(id)
  }

  /**
   * EvaluateThresholds: called with a vehicle's current mileage since its
   * last service. Generates a MaintenanceAlertGenerated event once 90% of
   * the configured service interval (Settings → Flota) is reached.
   */
  async evaluateMaintenanceThreshold(vehicle, kmSinceLastService) {
    const serviceIntervalKm = getFleetPreferences().maintenanceIntervalKm
    const ratio = kmSinceLastService / serviceIntervalKm
    if (ratio >= MAINTENANCE_THRESHOLD_RATIO) {
      const alert = await this.generateAlert({
        vehicleId: vehicle.id,
        alertType: `Mantenimiento próximo (${Math.round(ratio * 100)}% de kilometraje)`
      })
      await this.sendNotification({
        userId: vehicle.ownerId,
        alertId: alert.id,
        type: 'maintenance',
        message: `El vehículo ${vehicle.plate} alcanzó el ${Math.round(ratio * 100)}% del kilometraje de revisión preventiva.`
      })
      return alert
    }
    return null
  }

  async evaluateSpeedLimit(vehicle, speedKmh, limitKmh = getFleetPreferences().speedLimitKmh) {
    if (speedKmh > limitKmh) {
      const alert = await this.generateAlert({ vehicleId: vehicle.id, alertType: `Exceso de velocidad (${speedKmh} km/h)` })
      await this.sendNotification({
        userId: vehicle.ownerId,
        alertId: alert.id,
        type: 'speed',
        message: `El vehículo ${vehicle.plate} superó el límite de velocidad: ${speedKmh} km/h.`
      })
      return alert
    }
    return null
  }
}

export const alertsService = new AlertsService()
