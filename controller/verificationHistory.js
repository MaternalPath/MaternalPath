const { verifyPatientFund } = require('../models');

exports.getVerificationHistory = async (req, res, next) => {
    try {
        const hospitalId = req.user?.id;

        const totalVerification = await verifyPatientFund.count({
            where: { hospitalId }
        });

        const approvedRequest = await verifyPatientFund.count({
            where: {
                hospitalId,
                status: 'Approved'
            }
        });

        const pendingReviews = await verifyPatientFund.count({
            where: {
                hospitalId,
                status: 'Pending'
            }
        });

        const rejectedRequest = await verifyPatientFund.count({
            where: {
                hospitalId,
                status: 'Rejected'
            }
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
};