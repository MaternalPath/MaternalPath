require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

exports.initializeCardCharge = async (req, res, next) => {
  try {
    const paymentData = {
      reference: "test-card-payment-2",
      card: {
        name: "Test Cards",
        number: "5130000052131820",
        cvv: "419",
        expiry_month: "12",
        expiry_year: "32",
        pin: "0000", // optional
      },
      amount: 1000,
      currency: "NGN",
      redirect_url: "https://merchant-redirect-url.com",
      customer: {
        name: "John Doe",
        email: "johndoe@korapay.com",
      },
      metadata: {
        internalRef: "JD-12-68",
        age: 15,
        fixed: true,
      },
    };

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      process.env.KORA_ENCRYTION_KEY,
      iv,
    );
    const encrypted = cipher.update(JSON.stringify(paymentData), "utf8");

    const ivToHex = iv.toString("hex");
    const encryptedToHex = Buffer.concat([encrypted, cipher.final()]).toString(
      "hex",
    );

    const encryptedData = `${ivToHex}:${encryptedToHex}:${cipher.getAuthTag().toString("hex")}`;

    const { data } = await axios.post(
      "https://api.korapay.com/merchant/api/v1/charges/card",
      { charge_data: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_SK}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(200).json({
      message: "success",
      data,
    });
  } catch (error) {
    console.log(error.message),
    next({
      message: error.messsage,
      statusCode: 500,
    });
  }
};
