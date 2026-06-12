const notificationModel =
  require("../models/notification");

exports.getNotifications =
  async (req, res) => {
    try {
      const notifications =
        await notificationModel
          .find({
            hospital: req.user.id
          })
          .sort({
            createdAt: -1
          })
          .limit(10);

      res.status(200).json({
        notifications
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };