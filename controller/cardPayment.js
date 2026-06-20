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

exports.initiateCard = async (req, res, next) => {
  try {
    
    const koraKey = process.env.PAYMENT_API?.trim();
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
    "reference": data.data.reference, 
    "card": {
      	"name": "Test Cards",
        "number": "5130000052131820",
        "cvv": "419",
        "expiry_month": "12",
        "expiry_year": "32",
    },
    "amount": amount,
    "currency": "NGN",
    "redirect_url": "https://merchant-redirect-url.com",
    "customer": {
        "name": name,
        "email": mother.email
    },
    "metadata": {
       "internalRef": "JD-12-67",
       "age": 15,
       "fixed": true,
    }
}

    
const crypto = require("crypto");

function encryptAES256(encryptionKey, paymentData) {  
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-gcm', process.env.PAYMENT_API, iv);
  const encrypted = cipher.update(paymentData);

  const ivToHex = iv.toString('hex');
  const encryptedToHex = Buffer.concat([encrypted, cipher.final()]).toString('hex');
  
  return `${ivToHex}:${encryptedToHex}:${cipher.getAuthTag().toString('hex')}`;
}

    const { data } = await axios.post(`https://api.korapay.com/merchant/api/v1/charges/card`, payload, {
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