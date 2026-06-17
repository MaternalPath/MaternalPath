const { MotherUpdate, wallet } = require("../models");

exports.dashboardWeek =async (req, res, next) => {
    try {
        const id = req.user?.id;

if (!id) {
    return next({
        statusCode: 401,
        message: "Unauthorized",
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
        message: "Unauthorized",
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