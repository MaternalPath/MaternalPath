const { where } = require("sequelize");
const {firstTrimester, secondTrimester, thirdTrimester, Mother, pregnancyTip, dailyReminder} = require("../models");



exports.createFirst = async (req, res, next) => {
    try {
        const {
            whatToExpect,
            nutritionGuidance
        } = req.body;
        const trimester = await firstTrimester.create({
            whatToExpect,
            nutritionGuidance
        });

        console.log(trimester)

        res.status(201).json({
      message: "Information created successfully",
      trimester
    });
    } catch (error) {
        next({
      message: error.message,
      statusCode: 500,
    });
    }
};

exports.createSecond = async (req, res, next) => {
    try {
        const {
            whatToExpect,
            nutritionGuidance
        } = req.body;
        const trimester = await secondTrimester.create({
            whatToExpect,
            nutritionGuidance
        });

        console.log(trimester)

        res.status(201).json({
      message: "Information created successfully",
      trimester
    });
    } catch (error) {
        next({
      message: error.message,
      statusCode: 500,
    });
    }
}

exports.createThird = async (req, res, next) => {
    try {
        const {
            whatToExpect,
            nutritionGuidance
        } = req.body;
        const trimester = await thirdTrimester.create({
            whatToExpect,
            nutritionGuidance
        });

        console.log(trimester)

        res.status(201).json({
      message: "Information created successfully",
      trimester
    });
    } catch (error) {
        next({
      message: error.message,
      statusCode: 500,
    });
    }
};

exports.getTrimester = async (req, res, next) => {
    try {
        const id = req.user?.id;

    const mother = await Mother.findOne({
      where: { id },
    });

    // cron.schedule('0 9 * * 1', async () => {
    //     console.log('Running weekly reminders...');
    //     await reminderService.sendWeeklyReminders();
    // });
        const currentweek = mother.currentPregnancyWeek
        const firsttrim = [['First Trimester','Current', 'weeks 1-12','Initial prenatal visit', 'pregnancy confirmation'],['Second Trimester', 'weeks 13-26','Anatomy scan','Feel baby movements', 'Glucose screning'],['Third Trimester','Weeks 27-40','Hospital tour','Birth plan discussion','Final preparations']];
        const secondtrim = [['First Trimester','Completed', 'weeks 1-12','Initial prenatal visit', 'pregnancy confirmation'],['Second Trimester', 'Current','weeks 13-26','Anatomy san','Feel baby movements', 'Glucose screning'],['Third Trimester','Weeks 27-40','Hospital tour','Birth plan discussion','Final preparations']];
        const thirdtrim = [['First Trimester','Completed', 'weeks 1-12','Initial prenatal visit', 'pregnancy confirmation'],['Second Trimester', 'Completed','weeks 13-26','Anatomy san','Feel baby movements', 'Glucose screning'],['Third Trimester','Current','Weeks 27-40','Hospital tour','Birth plan discussion','Final preparations']];
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

exports.createMessage = async (req, res, next) => {
    try {
       const {week, message} = req.body;
       
       const data = await pregnancyTip.create({
        week,
        message
       })

       res.status(201).json({
        message: 'week created successfully',
        data
       })
    } catch (error) {
      next({
      message: error.message,
      statusCode: 500,
    });  
    }
}

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

exports.createDaily = async (req, res, next) => {
    try {
       const {dayNumber, message} = req.body;
       
       const data = await dailyReminder.create({
        dayNumber,
        message
       })

       res.status(201).json({
        message: 'day created successfully',
        data
       })
    } catch (error) {
      next({
      message: error.message,
      statusCode: 500,
    });  
    }
}

exports.dailyMessage = async (req, res, next) => {
    try {
        const id = req.user?.id;
        const mother = await Mother.findOne({where: {id}})

        const dueDate = new Date(mother.estimatedDueDate);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const daysLeft = Math.ceil(
        (dueDate - today) / (1000 * 60 * 60 * 24)
        );

        const pregnancyDay = 280 - daysLeft;

        const day = Math.max(1, Math.min(280, pregnancyDay));

        const reminder = await dailyReminder.findOne({
        where: {
            dayNumber: day
        }
        });

        res.status(200).json({
        pregnancyDay: day,
        reminder: reminder?.message || "No reminder available."
        });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}