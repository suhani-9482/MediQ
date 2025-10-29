import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for browser notifications
 * @returns {object} Notification methods and state
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  /**
   * Request notification permission
   * @returns {Promise<string>} Permission status
   */
  const requestPermission = useCallback(async () => {
    if (!supported) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }, [supported])

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {object} options - Notification options
   * @returns {Notification|null} Notification instance
   */
  const showNotification = useCallback((title, options = {}) => {
    if (!supported) {
      console.warn('Notifications not supported')
      return null
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/medical-icon.svg',
        badge: '/medical-icon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options
      })

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close()
      }, 10000)

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }, [supported, permission])

  /**
   * Show a reminder notification
   * @param {object} reminder - Reminder object
   * @returns {Notification|null} Notification instance
   */
  const showReminderNotification = useCallback((reminder) => {
    const icon = {
      medication: '💊',
      appointment: '🏥',
      lab_test: '🔬',
      refill: '📋'
    }[reminder.reminder_type] || '⏰'

    const body = reminder.medication_name 
      ? `${reminder.medication_name}${reminder.dosage ? ` - ${reminder.dosage}` : ''}`
      : reminder.description || 'Time for your reminder'

    return showNotification(`${icon} ${reminder.title}`, {
      body,
      tag: `reminder-${reminder.id}`,
      data: { reminderId: reminder.id }
    })
  }, [showNotification])

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    showReminderNotification
  }
}



