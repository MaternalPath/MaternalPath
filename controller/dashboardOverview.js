const { MotherUpdate, wallet, Mother, dailyReminder, motherNotification } = require("../models");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const { Op } = require("sequelize");
const cron = require("node-cron");
dayjs.extend(relativeTime);

exports.dashboardOverview = async (req, res, next) => {
    try {
        const id = req.user?.id;

        if (!id) {
            return next({
                statusCode: 401,
                message: "Invalid or missing user ID",
            });
        }

        const mother = await MotherUpdate.findOne({
            where: { motherId: id }
        });

if (!mother) {
    return next({
        statusCode: 404,
        message: "Mother record not found"
    });
}

const walletRecord = await wallet.findOne({
            where: { motherId: id }
        });

        if (!walletRecord) {
            return next({
                statusCode: 404,
                message: "Wallet record not found"
            });
        }

const today = new Date();
today.setHours(0, 0, 0, 0);

const estimatedDueDate = new Date(mother.estimatedDueDate);
estimatedDueDate.setHours(0, 0, 0, 0);

const daysUntilDueDate = Math.ceil(
    (estimatedDueDate - today) / (1000 * 60 * 60 * 24)
);

const pregnancyDay = 280 - daysUntilDueDate;

const progress = (mother.currentPregnancyWeek * 100) / 40;

const savingsProgress =
            mother.savingsGoalAmount > 0
                ? (walletRecord.currentBalance * 100) / mother.savingsGoalAmount
                : 0;

const reminder = await dailyReminder.findOne({
        where: {
            dayNumber: pregnancyDay
        }
        });

const info = {
    trimester: mother.trimester,
    week: mother.currentPregnancyWeek,
    estimatedDueDate: mother.estimatedDueDate,
    preferredHospital: mother.selectedHospital,
    daysUntilDueDate,
    pregnancyProgress: progress+'%'
};

const data = {
            currentBalance: walletRecord.currentBalance,
            savingsGoal: mother.savingsGoalAmount,
            savingsProgress
        }

const currentWeek = mother.currentPregnancyWeek;
const currentDay = mother.currentPregnancyWeek * 7;
        const notifications = await motherNotification.findAll({
        where: {
                [Op.or]: [{ week: currentWeek }, { dayNumber: currentDay }],
                attributes: { exclude: ['id', 'hospitalId', 'motherId'] }
              }});

        const result = notifications.map(item => ({
        ...item.toJSON(),
        time: dayjs(item.createdAt).fromNow(),
        }));

res.status(200).json({
    message: "Dashboard retrieved successfully",
    info,
    data,
    reminder: reminder || "No reminder available.",
    theWeeksFocus: result
});
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}