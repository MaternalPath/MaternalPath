const { Mother } = require('../models');
const otpGenerator = require('otp-generator');
const reference = otpGenerator.generate(10, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
const axios = require('axios');
const payment = require('../models/payment');

exports.makePayment = async (req, res, next) => {

    try {
        const id = req.user?.id;

if (!id) {
    return next({
        message: 'Unauthorized',
        statusCode: 401
    });
}
const mother = await Mother.findOne({
    where: { id }
});

if (!mother) {
    return next({
        message: 'Mother does not exist',
        statusCode: 404
    });
}
        const { amount } = req.body;

        const payload = {
            amount: payment.amount,
            customer: {
                email: mother.email,
                name: mother.firstName + ' ' + mother.lastName
            },
            redirect_url: 'https://maternalpath.onrender.com/api/v1/payment/payment-confirmation',
            currency: 'NGN',
            reference: reference
        };

        const { data} = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', payload, {
            headers: {
                Authorization:  `Bearer ${process.env.KORA_SK}`
            }
        });
        console.log(data)

        const motherBalance = new payment({
            amount: payment.amount,
            reference: data.data.reference,
            motherId : payment.motherId
        })
        
        await motherBalance.save();
        // const currentBalance = parseFloat(mother.currentBalance) + parseFloat(amount);
            // let currentBalance = payment.amount;
            // currentBalance += Number(amount);

        // await Mother.update({ currentBalance, amount }, { where: { id: mother.id } });

        res.status(200).json({
            message: 'Payment initiated successfully',
            currentBalance
        })

    } catch (error) {
      next({
            message: error.message,
            statusCode: 500
        })  
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query;
        const mother = await Mother.findOne({
            reference
        });

        if (!mother) {
            return next({
                message: `No initiated Payment found`,
                statusCode: 404
            })
        };

        const { data } = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`,
            {
                headers: {
                Authorization: `Bearer ${process.env.KORA_SK}`
            }}
        );

        console.log(data);

        if (data.status === true && data.data.status === 'processing') {
            payment.status = 'processing'
            await payment.save();
            return res.status(200).json({
                message: 'Payment is still processing'
            })
        };

        if (data.status === true && data.data.status === 'success') {
            payment.status = 'successful'
            const currentBalance = parseFloat(payment.currentBalance) + parseFloat(amount);
            await payment.save();
            return res.status(200).json({
                message: 'Payment successful'
            })
        };
    } catch (error) {
        next({
                message: error.message,
                statusCode: 500
            })
    }
}