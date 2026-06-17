const { MotherUpdate } = require("../models")


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

const info = {
    week: mother.currentPregnancyWeek,
    estimatedDueDate: mother.estimatedDueDate,
    preferredHospital: mother.selectedHospital,
    daysUntilDueDate
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