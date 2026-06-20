const {
  Mother,
  wallet,
  payment,
  MotherUpdate,
  transactionHistory,
} = require("../models");
const otpGenerator = require("otp-generator");
const dayjs = require("dayjs");
const axios = require("axios");

exports.initiatePayment = async (req, res, next) => {
  try {
    const koraKey = process.env.KORA_SK?.trim();
    
    if (!koraKey) {
      console.error('KORA_SK is not configured in environment variables');
      return next({
        message: 'Payment service is not properly configured',
        statusCode: 500
      });
    }

    const id = req.user?.id;
    const mother = await Mother.findByPk(id);

    if (!mother) {
      return next({
        message: `mother with ${id} not found`,
        statusCode: 404
      })
    }

    const reference = otpGenerator.generate(10, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const name = mother.firstName + ' ' + mother.lastName;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return next({
        message: 'Invalid amount provided',
        statusCode: 400
      });
    }

    const payload = {
      amount: amount,
      customer: {
        email: mother.email,
        name: name
      },
      redirect_url: 'https://maternal-path-fe.vercel.app/',
      currency: 'NGN',
      reference: reference
    };

    const { data } = await axios.post(`${process.env.PAYMENT_API}/charges/initialize`, payload, {
      headers: {
        Authorization: `Bearer ${koraKey}`
      },
    })

    const motherBalance = await payment.create({
      amount: amount,
      reference: data.data.reference,
      motherId: id
    });

    const transactions = await transactionHistory.create({
      amount: amount,
      date: new Date(),
      motherId: id,
    })

    res.status(200).json({
      message: "Payment initiated successfully",
      data
    })
  } catch (error) {
    console.error('Payment error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      return next({
        message: 'Kora API authentication failed. Please check your API key.',
        statusCode: 403
      });
    }

    if (error.response?.status === 400) {
      return next({
        message: error.response.data?.message || 'Invalid payment request',
        statusCode: 400
      });
    }

    next({
      message: error.message || 'Payment initialization failed',
      statusCode: error.response?.status || 500
    });
  }
}

exports.initialize = async (req, res, next) => {
  try{

  }catch(error){
    message: error.message
  }
}

exports.verifyPayment = async (req, res, next) => {
  try {
    const koraKey = process.env.KORA_SK?.trim();
    
    if (!koraKey) {
      console.error('KORA_SK is not configured in environment variables');
      return next({
        message: 'Payment service is not properly configured',
        statusCode: 500
      });
    }

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
          Authorization: `Bearer ${koraKey}`,
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

    console.log(walletRec.currentBalance);

    if (data.status === true && data.data.status === "success") {
      paymentRecord.status = "successful";
      walletRec.dataValues.currentBalance += paymentRecord.dataValues.amount;
      await walletRec.save();
      await paymentRecord.save();

      const balance = walletRec.currentBalance;
      const goals = MotherUpdate.savingsGoalAmount;
      const remainingAmountNeeded = goals - balance;

      return res.status(200).json({
        message: "Payment successful",
        balance,
        goals,
        remainingAmount: remainingAmountNeeded,
      });
    }

    if (data.status === true && data.data.status === "success") {
      transactionHistory.status = "Completed";
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      return next({
        message: 'Kora API authentication failed. Please check your API key.',
        statusCode: 403
      });
    }

    next({
      message: error.message || 'Payment verification failed',
      statusCode: error.response?.status || 500,
    });
  }
};

exports.monthlyGoals = async (req, res, next) => {
  try {
    const payments = await payment.findAll({
      where: {
        motherId: req.user.id,
        status: "successful",
      },
    });

    const monthlySavings = {};

    for (let i = 0; i < 12; i++) {
      const month = dayjs().month(i).format("MMMM");
      monthlySavings[month] = 0;
    }

    payments.forEach((payment) => {
      const month = dayjs(payment.createdAt).format("MMMM");
      monthlySavings[month] += Number(payment.amount);

      if (!monthlySavings[month]) {
        monthlySavings[month] = 0;
      }

      monthlySavings[month] += Number(payment.amount);
    });

    console.log(monthlySavings);

    res.status(200).json({
      message: "monthly payment retrieved successfully",
      monthlySavings,
    });
  } catch (error) {
    next({
      message: error.message,
      statusCode: 500,
    });
  }
};

// Alias for backwards compatibility
exports.makePayment = exports.initiatePayment;
