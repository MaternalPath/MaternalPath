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
const { Op } = require("sequelize");
const { where } = require("sequelize");
const crypto = require("crypto");

const getPaymentApiUrl = () => {
  const baseUrl = process.env.PAYMENT_API?.trim() || 'https://api.korapay.com/merchant/api/v1';
  const normalizedUrl = baseUrl.replace(/\/$/, '');
  return `${normalizedUrl}/charges/initialize`;
};

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
      upperCaseAlphabets: true,
      lowerCaseAlphabets: true,
      specialChars: true,
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
      amount:Number(amount) ,
      customer: {
        email: mother.email,
        name: name
      },
      redirect_url: "https://maternal-path-fe.vercel.app/fundsSuccess",
      currency: 'NGN',
      reference: reference
    };
const sk = process.env.KORA_SK

    const { data } = await axios.post(
  "https://api.korapay.com/merchant/api/v1/charges/initialize",
  payload,
  {
    headers: {
      Authorization: `Bearer ${sk}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  }
);
    
        const motherBalance = await payment.create({
      amount: amount,
      reference: data.data.reference,
      date: new Date(),
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

    next({
      message: error.message || 'Payment initialization failed',
      statusCode: error.response?.status || 500
    });
  }
}


exports.verifyPayment = async (req, res, next) => {
  try {
    const koraKey = process.env.KORA_SK?.trim();

if (!koraKey) {
  console.error("KORA_SK is not configured in environment variables");
  return next({
    message: "Payment service is not properly configured",
    statusCode: 500,
  });
}

const { reference } = req.query;

if (!reference) {
  return next({
    message: "Payment reference is required",
    statusCode: 400,
  });
}

const paymentRecord = await payment.findOne({
  where: { reference },
});

if (!paymentRecord) {
  return next({
    message: "Payment record not found",
    statusCode: 404,
  });
}

const walletRec = await wallet.findOne({
  where: { motherId: paymentRecord.motherId },
});

if (!walletRec) {
  return next({
    message: "No wallet found",
    statusCode: 404,
  });
}

const history = await transactionHistory.findOne({
  where: {
    motherId: paymentRecord.motherId,
  },
});

const { data } = await axios.get(
  `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
  {
    headers: {
      Authorization: `Bearer ${koraKey}`,
    },
  }
);

console.log("Kora verify response:", JSON.stringify(data, null, 2));

const paymentStatus = data?.data?.status?.toLowerCase();

// if (
//   paymentStatus === "processing" ||
//   paymentStatus === "pending"
// ) {
//   paymentRecord.status = "pending";
//   await paymentRecord.save();

//   return res.status(200).json({
//     message: "Payment is still processing",
//   });
// }

if (
  paymentStatus === "true" ||
  paymentStatus === "success" ||
  paymentStatus === "successful" ||
  paymentStatus === "completed"
) {
  
  if (paymentRecord.status !== "successful") {
    paymentRecord.status = "successful";

    walletRec.currentBalance =
      Number(walletRec.currentBalance || 0) +
      Number(paymentRecord.amount || 0);

    await walletRec.save();
    await paymentRecord.save();

    const history = await transactionHistory.findOne({
      where: { motherId: paymentRecord.motherId}
    })

    if (history) {
      history.status = "Completed";
      await history.save();
    }
  }

  const mother = await MotherUpdate.findOne({
    where: { motherId: paymentRecord.motherId },
  });

  const balance = Number(walletRec.currentBalance || 0);
  const goals = Number(mother?.savingsGoalAmount || 0);
  const remainingAmountNeeded = goals - balance;

  return res.status(200).json({
    message: "Payment successful",
    balance,
    goals,
    remainingAmount: remainingAmountNeeded,
  });
} else{
  paymentRecord.status = "failed";
  await paymentRecord.save();

  const history = await transactionHistory.findOne({
    where: {motherId: paymentRecord.motherId}
  })

  if (history) {
    history.status = "Failed";
    await history.save();
  }

  return res.status(400).json({
    message: "Payment failed",
  });
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

exports.webhook = async (req, res, next) => {
    try {
  const { event, data } = req.body;
  const hash = crypto.createHmac("sha256", process.env.KORA_SK).update(JSON.stringify(data)).digest("hex");
  const signature = req.headers["x-korapay-signature"];
  if (hash !== signature) return res.status(401).json({
    message: "Invalid webhook signature"
  });
  const paymentRecord = await payment.findOne({where:{reference: data.reference}})
  if (!paymentRecord ) return res.status(404).json({
    message: "NO payment record found"
  });
    

  const walletRec = await wallet.findOne({
  where: { motherId: paymentRecord.motherId },
});

if (!walletRec) {
  return next({
    message: "No wallet found",
    statusCode: 404,
  });
}


  if (event === 'charge.success') {
    paymentRecord.status = "Completed",
    walletRec.currentBalance = Number(walletRec.currentBalance || 0) + Number(paymentRecord.amount || 0)
    await walletRec.save();
    await paymentRecord.save();
    
} else if (event === 'charge.failed') {
    paymentRecord.status = "Failed",
    await paymentRecord.save();

    
};

  res.status(200).json({
    success: true,
    status: "successful",
    message: 'Payment verified successfully'
  })
} catch (error) {
    console.log(error.message)
    next(error)
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

exports.makePayment = exports.initiatePayment;
