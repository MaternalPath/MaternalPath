const { Mother, wallet, payment, MotherUpdate } = require("../models");
const otpGenerator = require("otp-generator");
const reference = otpGenerator.generate(10, {
  digits: true,
  upperCaseAlphabets: false,
  lowerCaseAlphabets: false,
  specialChars: false,
});
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
    const { amount } = req.body;

    const payload = {
      amount: amount,
      customer: {
        email: mother.email,
        name: mother.firstName + " " + mother.lastName,
      },
      redirect_url: "http://localhost:2245/api/v1/payment/payment",
      currency: "NGN",
      reference: reference,
    };
    const { data } = await axios.post(
      "https://api.korapay.com/merchant/api/v1/charges/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_SK}`,
        },
      },
    );
    console.log(data);

    const motherBalance = await payment.create({
      amount: amount,
      reference: data.data.reference,
      motherId: id,
    });

    // const currentBalance = parseFloat(mother.currentBalance) + parseFloat(amount);
    // let currentBalance = payment.amount;
    // currentBalance += Number(amount);

    // await Mother.update({ currentBalance, amount }, { where: { id: mother.id } });

    res.status(200).json({
      message: "Payment initiated successfully",
      data,
    });
  } catch (error) {
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
    const { Op } = require('sequelize');

const now = new Date();

const startOfMonth = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

const endOfMonth = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  1
);

const monthlyTotal = await payment.sum('amount', {
  where: {
    motherId: req.user.id,
    createdAt: {
      [Op.gte]: startOfMonth,
      [Op.lt]: endOfMonth
    }
  }
});

console.log(monthlyTotal || 0);

res.status(200).json({
  message: "monthly payment retrieved successfully",
  monthlyTotal
})
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500
    })
  }
}
