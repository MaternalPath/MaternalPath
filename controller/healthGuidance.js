const { MotherUpdate, pregnancyTip} = require("../models");


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
                        message: 'mother does not exist',
                        statusCode: 400
                    })
                }
                const today = new Date();
        
            const dueDate = new Date(mother.estimatedDueDate);
        
            const daysLeft = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24)
            );
        
            const currentWeek = 40 - Math.floor(daysLeft / 7);
        
            const tip = await pregnancyTip.findOne({
           where: { week: currentWeek }
            });

            const status = "You and your baby are doing well. Continue following your personalized care plan."

            const focus = tip.title
        
            res.status(200).json({
                wellnessStatus: status,
                focus
            })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}