const { MotherUpdate, pregnancyTip, healthGuide, trimesterSymptoms, wellnessAndSelfCare} = require("../models");
// const { trimesterSymptoms, wellnessAndSelfCare } = require("./trimester");


exports.healthGuidance = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(404).json({
                message: 'Mother not found'
            })
        }
                const mother = await MotherUpdate.findOne({where: {motherId:id}})
                if (!mother) {
                    return next({
                        message: 'Mother does not exist',
                        statusCode: 400
                    })
                }
                const today = new Date();
        
            const dueDate = new Date(mother.estimatedDueDate);
        
            const daysLeft = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24)
            );
        
            const currentWeek = 40 - Math.floor(daysLeft / 7);
            const trimester = currentWeek <= 13
                ? 'First Trimester'
                : currentWeek <= 27
                    ? 'Second Trimester'
                    : 'Third Trimester';
        
            const tip = await pregnancyTip.findOne({
                where: { week: currentWeek }
            });

            const nutrition = await healthGuide.findOne({
                where: {
                    dayNumber: currentWeek
                }
            });

            const trimesterGuide = await trimesterSymptoms.findOne({
                order: [['createdAt', 'DESC']]
            });

            const wellness = await wellnessAndSelfCare.findOne({
                where: {
                    week: currentWeek
                }
            });

            const status = "You and your baby are doing well. Continue following your personalized care plan.";
            const focus = tip?.title || 'Weekly health tip unavailable.';
            const health = "Healthy Progress";
            const metrix = {
                trimester: mother.trimester,
                week: mother.currentPregnancyWeek,
                };
        
            res.status(200).json({
                metrix,
                wellnessStatus: status,
                focus,
                healthStatus: health,
                nutrition,
                trimesterGuide,
                wellness,
                status
            });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}