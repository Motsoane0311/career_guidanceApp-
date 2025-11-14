const { db } = require('../config/firebase');

class NotificationService {
  static async sendNotification(userId, title, message, type = 'info') {
    try {
      await db.collection('notifications').add({
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async sendAdmissionNotification(studentId, institutionName, courseName, status) {
    const title = 'Admission Decision';
    let message = '';
    
    switch (status) {
      case 'admitted':
        message = `Congratulations! You have been admitted to ${courseName} at ${institutionName}`;
        break;
      case 'rejected':
        message = `Your application for ${courseName} at ${institutionName} was not successful`;
        break;
      case 'waiting_list':
        message = `You have been placed on the waiting list for ${courseName} at ${institutionName}`;
        break;
      default:
        return;
    }

    await this.sendNotification(studentId, title, message, status === 'admitted' ? 'success' : 'info');
  }

  static async sendJobMatchNotification(studentId, jobTitle, companyName, matchScore) {
    const title = 'New Job Match';
    const message = `You have a ${matchScore}% match for ${jobTitle} at ${companyName}`;
    
    await this.sendNotification(studentId, title, message, 'info');
  }

  static async getUserNotifications(userId, limit = 10) {
    try {
      const notificationsSnapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const notifications = [];
      notificationsSnapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId) {
    try {
      await db.collection('notifications').doc(notificationId).update({
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}

module.exports = NotificationService;