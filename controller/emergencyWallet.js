const { MotherUpdate, wallet, payment, transactionHistory, Mother, billsAndVerification} = require('../models')
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

exports.emergencyWallet = async (req, res, next) => {
    try {
        const id = req.user?.id;

        if (!id) {
            return next({
                statusCode: 401,
                message: "Invalid or missing user ID",
            });
        }

        const historyRecord = await payment.findAll({
            where: { motherId: id },
            order: [['createdAt', 'DESC']]
        });

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


const payments = await payment.findAll({
  where: {
    motherId: req.user.id,
    status: ["Completed","successful"]
  }
});
const paymentRecord = await payment.findOne({
  where: {
    motherId: req.user.id,
    status: ["Completed","successful"]
  },
  order: [["createdAt", "DESC"]]
});

const today = new Date();
today.setHours(0, 0, 0, 0);

const estimatedDueDate = new Date(mother.estimatedDueDate);
estimatedDueDate.setHours(0, 0, 0, 0);

const daysUntilDueDate = Math.ceil(
    (estimatedDueDate - today) / (1000 * 60 * 60 * 24)
);

const progress = (mother.currentPregnancyWeek * 100) / 40;


        if (!walletRecord) {
            return next({
                statusCode: 404,
                message: "Wallet record not found"
            });
        }

        // const balance = walletRecord.currentBalance += Number(paymentRecord.amount)

        const total = 285000 * 100 / 400000;
        const decimal = Math.floor(total);

        const savingsProgress =
            walletRecord.currentBalance > 0
                ? Math.ceil((walletRecord.currentBalance * 100) / mother.savingsGoalAmount)
                : 0;
          
        let preparedness = ""
    
        if (savingsProgress <= 0) {
            preparedness = 'very low Preparedness'
        }else if (savingsProgress <= 20) {
          preparedness = 'low Preparedness'
        }else if (savingsProgress <= 60) {
            preparedness = 'average Preparedness'
        }else if (savingsProgress <= 95) {
            preparedness = 'moderate Preparedness'
        }else {
            preparedness = 'fully Prepared'
        }

        const remainingAmount =  mother.savingsGoalAmount - walletRecord.currentBalance;

        const monthlySavings = {};
        const signupMonth = dayjs(mother.createdAt).month();

        for (let i = signupMonth; i < 12; i++) {
          const month = dayjs().month(i).format("MMMM");
          monthlySavings[month] = 0;
        }
        
        payments.forEach((payment) => {
        const month = dayjs(payment.createdAt).format("MMMM");

        if (month in monthlySavings) {
            monthlySavings[month] += Number(payment.amount || 0);
        }
    });
    

        const totalSavings = payments.reduce(
          (sum, amount) => sum + Number(payment.amount || 0),
          0
        );
        
        const remainingWeek = 40 - mother.currentPregnancyWeek
        const contribution = payments.amount;
        
        const savings = Math.round(mother.savingsGoalAmount / remainingWeek)
        const currentBalance =walletRecord.currentBalance;
        const savingsGoalAmount =mother.savingsGoalAmount;
        const half = Number(savingsGoalAmount)/2;
        const week = mother.currentPregnancyWeek;
        const progres = (currentBalance / savingsGoalAmount) * 100;
        const pregnancyProgress = (week / 40) * 100;

        let response;

        if (progres > pregnancyProgress) {
            response = "At your current pace, you'll exceed your goal";
          } else if (progres === pregnancyProgress) {
              response = "At your current pace, you'll reach 100% of your goal";
          } else {
              response = "At your current pace, you'll not reach your goal";
          }
        const latestPayment = paymentRecord ? paymentRecord.amount : 0;
        const data = {"WeeklyContributionRecommendation": `Saving ${savings} weekly can help you reach your goal before delivery`, "Current weekly contribution": `${latestPayment} per week`, "Weeks Remaining until Due Date": `${remainingWeek} weeks`,  "On Track": response};
        

const info = {
    trimester: mother.trimester,
    week,
    estimatedDueDate: mother.estimatedDueDate,
    preferredHospital: mother.selectedHospital,
    currentBalance,
    savingsGoal: savingsGoalAmount,
    savingsProgress: Math.ceil(savingsProgress)+'%',
    remainingAmountNeeded:  remainingAmount,
    daysUntilDueDate,
    preparedness
};
const history = historyRecord.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

res.status(200).json({
    message: "Emergency Wallet",
    info,
    monthlySavings,
    data,
    history
});
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const id = req.user?.id;
    const { otp } = req.body;

    const mother = await Mother.findOne({
      where: { id },
    });

    const admin = await adminBillVerify.findOne({
      where: { id },
    });

    const bills = await billsandverification.findOne({
      where: { motherId: id },
    });

    if (!mother) {
      return res.status(404).json({
        message: "Mother not found",
      });
    }
    if (!admin) {
      return res.status(404).json({
        message: "Mother bill not found",
      });
    }

    if (new Date() > admin.otpExpiresAt || admin.otp != otp) {
      return res.status(404).json({
        message: "Invalid OTP",
      });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpiresAt = null;
    bills.billsandverification = "view"

    await admin.save();
    await bills.save();

    res.status(200).json({
      message: "Bill verified successfully",
    });
  } catch (error) {
    return next({
      message: error.message,
      statusCode: 500,
    });
  }
};