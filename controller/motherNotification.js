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

        const motherUpdate = await MotherUpdate.findOne({
            where: {
                motherId: id
            }
            });

            if (!motherUpdate) {
            return next({
                message: "Mother update not found",
                statusCode: 404
            });
            }
        const currentWeek = await motherUpdate.currentPregnancyWeek;
        const currentDay = await motherUpdate.currentPregnancyWeek * 7;
        console.log(currentDay)
        const notifications = await motherNotification.findAll({
        where: {
                [Op.or]: [{ week: currentWeek }, { dayNumber: currentDay }],
              }});

        const result = notifications.map(item => ({
        ...item.toJSON(),
        time: dayjs(item.createdAt).fromNow(),
        }));

        cron.schedule("0 8 * * *", async () => {  
         res.status(200).json({
            message: 'All notifications',
            data: result
          })
        });
        
    } catch (error) {
       next({
        message: error.message,
        statusCode: 500
       }) 
    }
}