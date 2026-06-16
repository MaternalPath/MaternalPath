const { uploadedBill } = require("../models")


exports.checkBill = async(req, res, next) => {
    try {
        const id = req.user?.id

        if (!id) {
            return next({
                message: `User with ${id} not found`,
                statusCode: 404
            })
        }

        const hospitals = await uploadedBill.findAll();

        const data = hospitals.map(bill => ({
            billRef: bill.billNumber,
            patientName: bill.fullName,
            hospital: bill.hospitalName,
            amount: bill.amount,
            uploadDate: bill.billingDate
        }));

        res.status(200).json({
            message: 'bills retrieved successfully',
            data
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}