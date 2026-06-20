const { where } = require("sequelize");
const { MotherUpdate, motherNotification } = require('../models');
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const { Op } = require("sequelize");
const cron = require("node-cron");
dayjs.extend(relativeTime);

exports.getNotifications = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(404).json({
                message: 'Id not found'
            })
        }
        dayjs.extend(relativeTime);

        const mother = await MotherUpdate.findOne({
            where: {
                motherId: id
            }
            });

            if (!mother) {
            return next({
                message: "Mother update not found",
                statusCode: 404
            });
            }
        const currentWeek = await mother.currentPregnancyWeek;
        const currentDay = await mother.currentPregnancyWeek * 7;
        console.log(currentDay)
        const notifications = await motherNotification.findAll({
        where: {
                [Op.or]: [{ week: currentWeek }, { dayNumber: currentDay }],
              }});

        const result = notifications.map(item => ({
        ...item.toJSON(),
        time: dayjs(item.createdAt).fromNow(),
        }));
 
         res.status(200).json({
            message: 'All notifications',
            data: result
          })
        
    } catch (error) {
       next({
        message: error.message,
        statusCode: 500
       }) 
    }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildWhereClause(req) };

    const notification = await motherNotification.findOne({ where });
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



exports.markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildWhereClause(req) };

    const notification = await motherNotification.findOne({ where });
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


exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id, ...buildWhereClause(req) };

    const notification = await motherNotification.findOne({ where });
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


exports.getUnreadNotifications = async (req, res) => {
  try {
    const where = { isRead: false, ...buildWhereClause(req) };
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await motherNotification.findAndCountAll({
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


exports.getReadNotifications = async (req, res) => {
  try {
    const where = { isRead: true, ...buildWhereClause(req) };
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await motherNotification.findAndCountAll({
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


exports.getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const where = { status, ...buildWhereClause(req) };

    const validStatuses = ['allNotifications','pregnancyUpdates', 'healthReminders', 'walletAlerts', 'hospitalNotifications'];
    if (!validStatuses.includes(type)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await motherNotification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      message: `Notifications with type '${type}' retrieved successfully`,
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


exports.getRecentNotifications = async (req, res) => {
  try {
    const where = buildWhereClause(req);

    const notifications = await motherNotification.findAll({
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


exports.getNotificationCount = async (req, res) => {
  try {
    const where = buildWhereClause(req);

    const totalNotifications = await motherNotification.count({ where });
    const unreadCount = await motherNotification.count({ where: { ...where, isRead: false } });
    const readCount = await motherNotification.count({ where: { ...where, isRead: true } });

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

// exports.createSystemNotification = async (req, res) => {
//   try {
//     const { title, message, type, status, metadata } = req.body;

//     // Validation
//     if (!title || !title.trim()) {
//       return res.status(400).json({ message: 'Title is required' });
//     }
//     if (!message || !message.trim()) {
//       return res.status(400).json({ message: 'Message is required' });
//     }

//     // Get all hospital IDs
//     const mothers = await Mother.findAll({ attributes: ['id'] });

//     if (mothers.length === 0) {
//       return res.status(404).json({ message: 'No hospitals found to notify' });
//     }

//     // Create a notification for each hospital
//     const notificationData = mothers.map(hospital => ({
//       hospitalId: hospital.id,
//       title: title.trim(),
//       message: message.trim(),
//       type: type || 'system_notification',
//       status: status || 'info',
//       isRead: false,
//       metadata: metadata || null,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     }));

//     await motherNotification.bulkCreate(notificationData);

//     res.status(201).json({
//       message: `System notification sent to ${mothers.length} hospitals successfully`,
//       count: mothers.length
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error creating system notification',
//       error: error.message
//     });
//   }
// };