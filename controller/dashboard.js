const { MotherUpdate, wallet, Mother, dailyReminder } = require("../models");

exports.dashboardWeek = async (req, res, next) => {
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

const today = new Date();
today.setHours(0, 0, 0, 0);

const estimatedDueDate = new Date(mother.estimatedDueDate);
estimatedDueDate.setHours(0, 0, 0, 0);

const daysUntilDueDate = Math.ceil(
    (estimatedDueDate - today) / (1000 * 60 * 60 * 24)
);

const progress = (mother.currentPregnancyWeek * 100) / 40;

const info = {
    trimester: mother.trimester,
    week: mother.currentPregnancyWeek,
    estimatedDueDate: mother.estimatedDueDate,
    preferredHospital: mother.selectedHospital,
    daysUntilDueDate,
    pregnancyProgress: progress+'%'
};

res.status(200).json({
    message: "Pregnancy journey overview",
    info
});
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.emergencyWallet = async (req, res, next) => {
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

        const total = 285000 * 100 / 400000;
        const decimal = Math.floor(total);
        console.log(total, decimal);

        const savingsProgress =
            mother.savingsGoalAmount > 0
                ? (walletRecord.currentBalance * 100) / mother.savingsGoalAmount
                : 0;

        const info = {
            currentBalance: walletRecord.currentBalance,
            savingsGoal: mother.savingsGoalAmount,
            savingsProgress
        }

        res.status(200).json({
            message: 'wallet retrieved successfully',
            info
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.todaysReminder = async (req, res, next) => {
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

        const today = new Date();
            today.setHours(0, 0, 0, 0);

            const estimatedDueDate = new Date(mother.estimatedDueDate);
            estimatedDueDate.setHours(0, 0, 0, 0);

            const daysUntilDueDate = Math.ceil(
                (estimatedDueDate - today) / (1000 * 60 * 60 * 24)
            );

        const pregnancyDay = 280 - daysUntilDueDate;

        // const day = Math.max(1, Math.min(280, pregnancyDay));

        const reminder = await dailyReminder.findOne({
        where: {
            dayNumber: pregnancyDay
        }
        });
        console.log(pregnancyDay)

        res.status(200).json({
        // pregnancyDay: day,
        reminder: reminder || "No reminder available."
        });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

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