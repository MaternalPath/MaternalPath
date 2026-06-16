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

exports.getVerificationRecords = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
            whereClause.status = status;
        }

        // If the request comes from a hospital user, scope to their records
        if (req.user?.role === 'hospital') {
            whereClause.hospitalId = req.user.id;
        }

        const { count, rows } = await verifyPatientFund.findAndCountAll({
            where: whereClause,
            attributes: [
                'id',
                'patientName',
                'pregnancyWeek',
                'hospitalName',
                'walletBalance',
                'status',
                'verifiedAt',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            message: 'Verification records fetched successfully',
            data: {
                total: count,
                currentPage: Number(page),
                totalPages: Math.ceil(count / limit),
                records: rows
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}
