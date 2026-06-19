const { Mother, wallet, payment, MotherUpdate, transactionHistory } = require("../models");
const otpGenerator = require("otp-generator");
const dayjs = require("dayjs");
const axios = require("axios");


exports.makePayment = async (req, res, next) => {
  try {
    const id = req.user?.id;
    
    if (!id) {
      return next({
        message: "Unauthorized",
        statusCode: 401,
      });
    }
    const mother = await Mother.findOne({
      where: { id },
    });
    
    if (!mother) {
      return next({
        message: "Mother does not exist",
        statusCode: 404,
      });
    }
    const reference = otpGenerator.generate(10, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const { amount } = req.body;

    const payload = {
      amount: amount,
      customer: {
        email: mother.email,
        name: mother.firstName + " " + mother.lastName,
      },
      redirect_url:"https://www.google.com",
      currency: "NGN",
      reference: reference
    };

    console.log('before kora response', payload)
    
    const { data } = await axios.post(
      "https://api.korapay.com/merchant/api/v1/charges/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_SK}`,
        },
      },
    );

    console.log('after kora response', data)

    const motherBalance = new payment({
      amount: amount,
      reference: data.data.reference,
      motherId: id,
    });
    const transactions = new transactionHistory({
      amount: amount,
      date: new Date(),
      motherId: id,
    });

    // await motherBalance.save();
    // await transactions.save();
    // const currentBalance = parseFloat(mother.currentBalance) + parseFloat(amount);
    // let currentBalance = payment.amount;
    // currentBalance += Number(amount);

    // await Mother.update({ currentBalance, amount }, { where: { id: mother.id } });

    res.status(200).json({
      message: "Payment initiated successfully",
      data,
    });
  } catch (error) {
    console.log(error)
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.query;
    const paymentRecord = await payment.findOne({ where: { reference } });
    const walletRec = await wallet.findOne({
      where: { motherId: paymentRecord.dataValues.motherId },
    });

    if (!walletRec) {
      return next({
        message: `No wallet found`,
        statusCode: 404,
      });
    }

    const { data } = await axios.get(
      `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_SK}`,
        },
      },
    );

    console.log(data);

    if (data.status === true && data.data.status === "processing") {
      paymentRecord.status = "processing";
      await paymentRecord.save();
      return res.status(200).json({
        message: "Payment is still processing",
      });
    }

    console.log(walletRec.currentBalance)

    if (data.status === true && data.data.status === "success") {
      paymentRecord.status = "successful";
      walletRec.dataValues.currentBalance += paymentRecord.dataValues.amount;
      await walletRec.save();
      await paymentRecord.save();

      const balance = walletRec.currentBalance
      const goals = MotherUpdate.savingsGoalAmount
      const remainingAmountNeeded = goals - balance

      return res.status(200).json({
        message: "Payment successful",
        balance,
        goals,
        remainingAmount: remainingAmountNeeded
      });
    }
    
    if (data.status === true && data.data.status === "success") {
      transactionHistory.status = "Completed";
    }
  } catch (error) {
    console.log(error);
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

exports.monthlyGoals = async (req, res, next) => {
  try {
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
}
