const { uploadedBill } = require("../models")


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
            where: { hospitalId: id }
        });

        const data = bills.map(bill => ({
            billRef: bill.billNumber,
            patientName: bill.fullName,
            hospital: bill.hospitalName,
            amount: bill.amount,
            uploadDate: bill.billingDate
        }));

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

exports.filterBill = async (req, res, next) => {
    try {
        
    } catch (error) {
      next({
        message:error.message,
        statusCode: 500
      })  
    }
}