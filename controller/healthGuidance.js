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
            const ironRichFoods = "Spinach, Kale, Pumpkin(Ugu), Waterleaf, Lean beef, Liver, Chicken, Turkey, Sardines, Tuna, Beans, Lentils, Chickpeas, Black-eyed peas, Soybeans, Tofu, Fortified cereals,Quinoa, Pumpkin seeds, Sesame seeds, Cashews, Raisins";
            const proteinSources = "Eggs, Chicken, Turkey, Lean beef, Fish, Salmon, Sardines, Tuna, Shrimp, Milk, Yoghurt, Cheese, Beans, Lentils, Chickpeas, Soybeans, Tofu, Groundnuts (Peanuts), Almonds, Cashews, Pumpkin seeds";

            const calciumRichFoods = "Milk, Yoghurt, Cheese, Sardines, Salmon, Tofu, Soy milk, Fortified plant-based milk, Spinach, Kale, Broccoli, Okra, Almonds, Sesame seeds, Chia seeds, Beans, White beans, Fortified cereals";

            const wholeGrains = "Brown rice, Oats, Millet, Whole wheat bread, Whole wheat pasta, Quinoa, Barley, Bulgur wheat, Sorghum, Corn (whole grain), Fonio, Buckwheat, Rye, Whole grain crackers, Whole grain cereals ";
        
            const currentWeek = 40 - Math.floor(daysLeft / 7);
            const trimester = currentWeek <= 13
                ? 'First Trimester'
                : currentWeek <= 27
                    ? 'Second Trimester'
                    : 'Third Trimester';
        
            const tip = await pregnancyTip.findOne({
                where: { week: currentWeek }, attributes: { exclude: ['time'] }
            });

            const nutrition = await healthGuide.findOne({
                where: {
                    dayNumber: currentWeek
                }, attributes: { exclude: ['time'] }
            });

            const trimesterGuide = await trimesterSymptoms.findOne({
                order: [['createdAt', 'DESC']]
            });

            const wellness = await wellnessAndSelfCare.findOne({
                where: {
                    week: currentWeek
                }, attributes: { exclude: ['time'] }
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
                ironRichFoods,
                proteinSources,
                calciumRichFoods,
                wholeGrains,
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