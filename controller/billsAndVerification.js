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

        const hospitals = await uploadedBill.findAll()

        const data = {
            billREf: hospitals.billNumber,
            patientName: hospitals.fullName,
            hospital: hospitals.hospitalName,
            amount: hospitals.amount,
            uploadDate: hospitals.billingDate
        }

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