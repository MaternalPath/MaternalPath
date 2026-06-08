const { Mother, wallet, payment } = require("../models");
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

    if (data.status === true && data.data.status === "success") {
      paymentRecord.status = "successful";
      walletRec.dataValues.currentBalance += paymentRecord.dataValues.amount;
      await walletRec.save();
      await paymentRecord.save();
      return res.status(200).json({
        message: "Payment successful",
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
