const { Notification, Hospital, Admin } = require('../models');
const { Op } = require('sequelize');

// =======================================================================
// HELPER: Build the base WHERE clause for role-based access
// =======================================================================
const buildWhereClause = (req) => {
  const where = {};

  // req.user comes from JWT token: { id, email, role? }
  // Hospital users only see their own notifications
  // Super Admin can see all (if role is 'admin')
  if (req.user.role !== 'admin') {
    where.hospitalId = req.user.id;
  }

  return where;
};

// =======================================================================
// POST /notifications/create
// Create a new notification (Super Admin or System can create)
// =======================================================================
exports.createNotification = async (req, res) => {
  try {
    const { hospitalId, title, message, type, status } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // If a hospitalId is provided, verify the hospital exists
    if (hospitalId) {
      const hospital = await Hospital.findByPk(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
    }

    const notification = await Notification.create({
      hospitalId: hospitalId || null,
      title: title.trim(),
      message: message.trim(),
      type: type || 'general',
      status: status || 'info',
      isRead: false,
    });

    res.status(201).json({
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating notification',
      error: error.message
    });
  }
};



// Get all notifications (paginated) for the authenticated user
exports.getNotifications = async (req, res) => {
  try {
    const where = buildWhereClause(req);
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'hospitalName']
        }
      ]
    });

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};


// // Get a single notification by ID
// // =======================================================================
// exports.getNotificationById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const where = { id, ...buildWhereClause(req) };

//     const notification = await Notification.findOne({
//       where,
//       include: [
//         {
//           model: Hospital,
//           as: 'hospital',
//           attributes: ['id', 'hospitalName']
//         }
//       ]
//     });

//     if (!notification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }

//     res.status(200).json({
//       message: 'Notification retrieved successfully',
//       data: notification
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error fetching notification',
//       error: error.message
//     });
//   }
// };



// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildWhereClause(req) };

    const notification = await Notification.findOne({ where });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating notification',
      error: error.message
    });
  }
};



// Mark a notification as unread
exports.markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildWhereClause(req) };

    const notification = await Notification.findOne({ where });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = false;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as unread',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating notification',
      error: error.message
    });
  }
};



// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildWhereClause(req) };

    const notification = await Notification.findOne({ where });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting notification',
      error: error.message
    });
  }
};



// Get all unread notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    const where = { isRead: false, ...buildWhereClause(req) };
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      message: 'Unread notifications retrieved successfully',
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching unread notifications',
      error: error.message
    });
  }
};



// Get all read notifications
exports.getReadNotifications = async (req, res) => {
  try {
    const where = { isRead: true, ...buildWhereClause(req) };
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      message: 'Read notifications retrieved successfully',
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching read notifications',
      error: error.message
    });
  }
};



// Get notifications by type (verification_alert, pending_review, etc.)
exports.getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const where = { type, ...buildWhereClause(req) };

    const validTypes = ['verification_alert', 'pending_review', 'bill_upload_update', 'payment_update', 'system_notification', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      message: `Notifications of type '${type}' retrieved successfully`,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching notifications by type',
      error: error.message
    });
  }
};



// Get notifications by status (info, warning, success, error)
exports.getNotificationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const where = { status, ...buildWhereClause(req) };

    const validStatuses = ['info', 'warning', 'success', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      message: `Notifications with status '${status}' retrieved successfully`,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching notifications by status',
      error: error.message
    });
  }
};


// Get the 5 most recent notifications
exports.getRecentNotifications = async (req, res) => {
  try {
    const where = buildWhereClause(req);

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.status(200).json({
      message: 'Recent notifications retrieved successfully',
      total: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching recent notifications',
      error: error.message
    });
  }
};


// Get total count of notifications for the authenticated user
exports.getNotificationCount = async (req, res) => {
  try {
    const where = buildWhereClause(req);

    const totalNotifications = await Notification.count({ where });
    const unreadCount = await Notification.count({ where: { ...where, isRead: false } });
    const readCount = await Notification.count({ where: { ...where, isRead: true } });

    res.status(200).json({
      message: 'Notification count retrieved successfully',
      data: {
        totalNotifications,
        unreadCount,
        readCount
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error counting notifications',
      error: error.message
    });
  }
};

// =======================================================================
// GET /notifications/stats
// Dashboard statistics for notifications
// Returns: total, pendingReviews, verificationAlerts, billUploadUpdates
// =======================================================================
exports.getNotificationStats = async (req, res) => {
  try {
    const where = buildWhereClause(req);

    const totalNotifications = await Notification.count({ where });
    const pendingReviews = await Notification.count({
      where: { ...where, type: 'pending_review' }
    });
    const verificationAlerts = await Notification.count({
      where: { ...where, type: 'verification_alert' }
    });
    const billUploadUpdates = await Notification.count({
      where: { ...where, type: 'bill_upload_update' }
    });
    const unreadCount = await Notification.count({
      where: { ...where, isRead: false }
    });

    res.status(200).json({
      message: 'Notification stats retrieved successfully',
      data: {
        totalNotifications,
        pendingReviews,
        verificationAlerts,
        billUploadUpdates,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching notification stats',
      error: error.message
    });
  }
};

// =======================================================================
// POST /notifications/create-system
// Create a notification for ALL hospitals (Super Admin only)
// =======================================================================
exports.createSystemNotification = async (req, res) => {
  try {
    const { title, message, type, status, metadata } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get all hospital IDs
    const hospitals = await Hospital.findAll({ attributes: ['id'] });

    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'No hospitals found to notify' });
    }

    // Create a notification for each hospital
    const notificationData = hospitals.map(hospital => ({
      hospitalId: hospital.id,
      title: title.trim(),
      message: message.trim(),
      type: type || 'system_notification',
      status: status || 'info',
      isRead: false,
      metadata: metadata || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Bulk create
    await Notification.bulkCreate(notificationData);

    res.status(201).json({
      message: `System notification sent to ${hospitals.length} hospitals successfully`,
      count: hospitals.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating system notification',
      error: error.message
    });
  }
};