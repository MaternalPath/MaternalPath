const { motherUpdate, pregnancyTip, firstTrimester, secondTrimester, thirdTrimester, Mother} = require('../models')


exports.getTrimester = async (req, res, next) => {
    try {
        const id = req.user?.id;

    const mother = await MotherUpdate.findOne({
      where: { motherId: id },
    });


        const currentweek = mother.currentPregnancyWeek
        const firsttrim = [['First Trimester','Current', 'weeks 1-12','Initial prenatal visit', 'pregnancy confirmation'],['Second Trimester', 'weeks 13-26','Anatomy scan','Feel baby movements', 'Glucose screning'],['Third Trimester','Weeks 27-40','Hospital tour','Birth plan discussion','Final preparations']];
        const secondtrim = [['First Trimester','Completed', 'weeks 1-12','Initial prenatal visit', 'pregnancy confirmation'],['Second Trimester', 'Current','weeks 13-26','Anatomy scan','Feel baby movements', 'Glucose screning'],['Third Trimester','Weeks 27-40','Hospital tour','Birth plan discussion','Final preparations']];
        const thirdtrim = [['First Trimester','Completed', 'weeks 1-12','Initial prenatal visit', 'pregnancy confirmation'],['Second Trimester', 'Completed','weeks 13-26','Anatomy scan','Feel baby movements', 'Glucose screning'],['Third Trimester','Current','Weeks 27-40','Hospital tour','Birth plan discussion','Final preparations']];
        if (currentweek <= 12) {
            const perTrimester = await firstTrimester.findAll({ attributes: { exclude: ['id']}});
            res.status(200).json({
                perTrimester,
                firsttrim
            })
        }else if (currentweek <= 26) {
            const perTrimester = await secondTrimester.findAll({ attributes: { exclude: ['id']}});
            res.status(200).json({
                perTrimester,
                secondtrim
            })    
            }else {
            const perTrimester = await thirdTrimester.findAll({ attributes: { exclude: ['id']}});
            res.status(200).json({
                perTrimester,
                thirdtrim
            })    
            }
    } catch (error) {
        next({
      message: error.message,
      statusCode: 500,
    });
    }
};

exports.weeklyMessage = async (req, res, next) => {
    try {
        const id = req.user?.id;
        const mother = await Mother.findOne({where: {id}})
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

    res.status(200).json({
        tip
    })
    } catch (error) {
        next({
      message: error.message,
      statusCode: 500,
    });
    }
}