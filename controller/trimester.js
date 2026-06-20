const { where } = require("sequelize");
const {firstTrimester, secondTrimester, thirdTrimester, Mother, pregnancyTip, dailyReminder, MotherUpdate, motherNotification} = require("../models");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const { Op } = require("sequelize");
const cron = require("node-cron");
dayjs.extend(relativeTime);


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
exports.trimesterSymptoms = async (req, res, next) => {
    try {
        const {
            whatToExpect
        } = req.body;
        const trimester = await trimesterSymptoms.create({
            whatToExpect
        });

        console.log(trimester)

        res.status(201).json({
      message: "Symptoms created successfully",
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

exports.createMessage = async (req, res, next) => {
    try {
       const {week, title, description} = req.body;

       const data = await pregnancyTip.create({
        week,
        title,
        description
       });

       const seconds = dayjs().diff(dayjs(data.createdAt), "second");

        await motherNotification.create({
        title,
        description,
        week,
        type: "pregnancyUpdates",
        status: "unread",
        time: `${seconds} seconds ago`
        });

       res.status(201).json({
        message: 'week created successfully',
        data
       });
    } catch (error) {
      next({
      message: error.message,
      statusCode: 500,
    });  
    }
}
exports.nutritionGuide = async (req, res, next) => {
    try {
       const {dayNumber, title, description} = req.body;

       const data = await healthGuide.create({
        dayNumber,
        title,
        description
       });

       const seconds = dayjs().diff(dayjs(data.createdAt), "second");

        await motherNotification.create({
        title,
        description,
        week
        });

       res.status(201).json({
        message: 'Guidance created successfully',
        data
       });
    } catch (error) {
      next({
      message: error.message,
      statusCode: 500,
    });  
    }
}
exports.wellnessAndSelfCare = async (req, res, next) => {
    try {
       const {week, title, description, foodsToAvoid} = req.body;

       const data = await wellnessAndSelfCare.create({
        week,
        title,
        description,
        foodsToAvoid
       });

       const seconds = dayjs().diff(dayjs(data.createdAt), "second");

        await motherNotification.create({
        title,
        description,
        week
        });

       res.status(201).json({
        message: 'Guidance created successfully',
        data
       });
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
        console.log("id:", id)
        const mother = await MotherUpdate.findOne({where: { motherId: id }})
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
       const {dayNumber, title, description} = req.body;
       
       const data = await dailyReminder.create({
        dayNumber,
        title,
        description
       });

       await motherNotification.create({
         title,
         description,
         dayNumber,
         type: 'healthReminders',
         status: 'unread',
         time: dayjs(data.createdAt).fromNow()
       });

       res.status(201).json({
        message: 'day created successfully',
        data
       });
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

exports.notificationByType = async (req, res, next) => {
    try {
        
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}