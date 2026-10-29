import { defineStore } from 'pinia'
import { alertsService } from '../../application/alerts.service.js'

/** Pinia store — Alerts & Notifications. Wraps AlertsService. */
export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [],
    notifications: []
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.isRead).length
  },
  actions: {
    async refresh() {
      const [alerts, notifications] = await Promise.all([alertsService.listAlerts(), alertsService.listNotifications()])
      this.alerts = alerts
      this.notifications = notifications
    },
    async markNotificationAsRead(id) {
      await alertsService.markNotificationAsRead(id)
      await this.refresh()
    },
    async markAllAsRead(userId) {
      await Promise.all(
        this.notifications.filter((n) => !n.isRead && n.userId === userId).map((n) => alertsService.markNotificationAsRead(n.id))
      )
      await this.refresh()
    }
  }
})
