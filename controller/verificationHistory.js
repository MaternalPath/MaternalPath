const { uploadedBill, Mother, Hospital } = require('../models');

exports.getverificationHistory = async (req, res, next) => {
    try {

        const hospitalId = req.user?.id;

        const totalVerification = await verification.countDocuments({
            hospital: hospitalId,
        });

        const approvedRequest = await verification.countDocuments({
            hospital: hospitalId,
            status: 'approved',
        });

        const pendingReviews = await verification.countDocuments({
            hospital: hospitalId,
            status: 'pending',
        });

        const rejectedRequest = await verification.countDocuments({
            hospital: hospitalId,
            status: 'declined',
        });

        res.status(200).json({
            totalVerification,
            approvedRequest,
            pendingReviews,
            rejectedRequest
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
