
const { Mother, Hospital, uploadedBill, adminBillVerify, billsAndVerification, Admin } = require('../models');


exports.checkBill = async(req, res, next) => {
    try {
        const id = req.user?.id

        if (!id) {
            return next({
                message: `User not authenticated`,
                statusCode: 401
            })
        }

        const bills = await uploadedBill.findAll({
        });

        const data = bills.map(bill => ({
            billRef: bill.billNumber,
            patientName: bill.fullName,
            hospitalId: bill.hospitalId,
            amount: bill.amount,
            uploadDate: bill.billingDate,
            motherId: bill.motherId
        }));
        await billsAndVerification.bulkCreate(data)

        res.status(200).json({
            message: 'Bills retrieved successfully',
            data
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.sendOTP = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await Admin.findOne({where: {id}});
        if (!user) {
    return next({
        message: "Admin not found",
        statusCode: 404
    });
}

const {motherId} = req.params;

        if (!motherId) {
    return next({
        message: "Mother not found",
        statusCode: 404
    });
}

const mother = await Mother.findOne({
    where: {id: motherId},
    order: [['createdAt', 'DESC']]
})
const bills = await uploadedBill.findOne({ where: { motherId}});
const name = `${mother.firstName} ${mother.lastName}`;
const amount = bills?.amount || 0;
    const billNumber = bills?.billNumber;
    const category = bills?.category;
    const dueDate = bills.estimatedDeliveryDate;
    const status = "Pending"
const email = mother?.email;
      
const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 10 * 60000);

    mother.otp = OTP;
    mother.otpExpiresAt = expiresAt;
    user.motherId = motherId
    user.otp = OTP;
    user.otpExpiresAt = expiresAt;

    const emailOptions = {
      email: email,
      subject: "Verify Your Bill",
      html: billTemplate(name, amount,billNumber, category, dueDate, status, OTP),
    };
    const data = await adminBillVerify.create({
        motherId: motherId,
    otp: OTP,
    otpExpiresAt: expiresAt,
    })

    if (process.env.NODE_ENV === "production") {
      await sendBrevoEmail(emailOptions);
    } else {
      await sendMail(emailOptions);
    }

    await mother.save();

res.status(200).json({
            message: 'OTP sent succesfully'
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.filterBill = async (req, res, next) => {
    try {
        
    } catch (error) {
      next({
        message:error.message,
        statusCode: 500
      })  
    }
}