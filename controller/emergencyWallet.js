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

        const history = await transactionHistory.findOne({
            where: { motherId: id }
        });

        // if (!history) {
        //     return next({
        //         statusCode: 404,
        //         message: "Mother record not found"
        //     });
        // } 

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

console.log("mother:", mother);

const payments = await payment.findAll({
  where: {
    motherId: req.user.id,
    status: "successful"
  }
});
const paymentRecord = await payment.findOne({
  where: {
    motherId: req.user.id,
    status: "successful"
  }
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

        const balance = walletRecord.currentBalance += Number(paymentRecord.amount)

        const total = 285000 * 100 / 400000;
        const decimal = Math.floor(total);

        const savingsProgress =
            walletRecord.currentBalance > 0
                ? (walletRecord.currentBalance * 100) / mother.savingsGoalAmount
                : 0;
          console.log("savings Progress:", savingsProgress);
          
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
        
        for (let i = 0; i < 12; i++) {
          const month = dayjs().month(i).format("MMMM");
          monthlySavings[month] = 0;
        }
        
        payments.forEach((payment) => {
          const month = dayjs(payment.createdAt).format("MMMM");
          // monthlySavings[month] += Number(payment.amount)
        
          if (!monthlySavings[month]) {
            monthlySavings[month] = 0;
          }
        
          monthlySavings[month] += Number(payment.amount);
        });

        const remainingWeek = 40 - mother.currentPregnancyWeek
        const contribution = payments.amount;

        const savings = mother.savingsGoalAmount / remainingWeek

        let response = ""

        if (contribution > savings) {
            response = "At your current pace, you'll exceed your goal"
        } else if (contribution === savings) {
            response = "At your current pace, you'll reach 100% of your goal"
        } else {
            response = "At your current pace, you'll not reach your goal"
        }

        const data = {"WeeklyContributionRecommendation": `Saving ${savings} weekly can help you reach your goal before delivery`, "Current weekly contribution": `${contribution} per week`, "Weeks Remaining until Due Date": `${remainingWeek} weeks`,  "On Track": response};
        

const info = {
    trimester: mother.trimester,
    week: mother.currentPregnancyWeek,
    estimatedDueDate: mother.estimatedDueDate,
    preferredHospital: mother.selectedHospital,
    currentBalance: balance,
    savingsGoal: mother.savingsGoalAmount,
    savingsProgress: savingsProgress+'%',
    remainingAmountNeeded:  remainingAmount,
    daysUntilDueDate,
    preparedness
};

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