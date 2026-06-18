const { MotherUpdate, wallet, payment} = require('../models')
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

exports.emergency = async (req, res, next) => {
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

        let preparedness 
    
        if (savingsProgress <= 25) {
            preparedness = 'low Preparedness'
        }
        if (savingsProgress <= 60) {
            preparedness = 'average Preparedness'
        }
        if (savingsProgress <= 95) {
            preparedness = 'moderate Preparedness'
        }
        if (savingsProgress === 100) {
            preparedness = 'fully Prepared'
        }

        const remainingAmount =  mother.savingsGoalAmount - walletRecord.currentBalance;
        

const info = {
    trimester: mother.trimester,
    week: mother.currentPregnancyWeek,
    estimatedDueDate: mother.estimatedDueDate,
    preferredHospital: mother.selectedHospital,
    currentBalance: walletRecord.currentBalance,
    savingsGoal: mother.savingsGoalAmount,
    savingsProgress,
    remainingAmountNeeded:  remainingAmount,
    daysUntilDueDate,
    pregnancyProgress: progress+'%',
    preparedness
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
};

exports.savingsProgress = async (req, res, next) => {
  try {
    const id = req.user?.id;

        if (!id) {
            return next({
                statusCode: 401,
                message: "Invalid or missing user ID",
            });
        }
const payments = await payment.findAll({
  where: {
    motherId: req.user.id,
    status: "successful"
  }
});

const monthlySavings = {};

for (let i = 0; i < 12; i++) {
  const month = dayjs().month(i).format("MMMM");
  monthlySavings[month] = 0;
}

payments.forEach((payment) => {
  const month = dayjs(payment.createdAt).format("MMMM");
  monthlySavings[month] += Number(payment.amount)

  if (!monthlySavings[month]) {
    monthlySavings[month] = 0;
  }

  monthlySavings[month] += Number(payment.amount);
});

console.log(monthlySavings);

res.status(200).json({
  message: "monthly payment retrieved successfully",
  monthlySavings
})
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500
    })
  }
};

exports.savingsInsights = async (req, res, next) => {
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
        const walletRecord = await wallet.findOne({
            where: { motherId: id }
        });

        if (!mother) {
            return next({
                statusCode: 404,
                message: "Mother record not found"
            });
        }

        const remainingWeek = 40 - mother.currentPregnancyWeek
        const contribution = walletRecord.amount;

        const savings = mother.savingsGoalAmount / remainingWeek

        let response = ""

        if (contribution > savings) {
            response = "At your current pace, you'll exceed your goal"
        } else if (contribution === savings) {
            response = "At your current pace, you'll reach 100% of your goal"
        } else {
            response = "At your current pace, you'll not reach your goal"
        }

        const info = {"WeeklyContributionRecommendation": `Saving ${savings} weekly can help you reach your goal before delivery`, "Current weekly contribution": `${contribution} per week`, "Weeks Remaining until Due Date": `${remainingWeek} weeks`,  "On Track": response};

        res.status(200).json({
            message: 'Savings Insight',
            info
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode:500
        })
    }
}