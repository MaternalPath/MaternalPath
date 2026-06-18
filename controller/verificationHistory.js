const { verifyPatientFund } = require('../models');

const generateverificationNumber = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `VER-${randomNumber}`;
};

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
                'patientName',
                'pregnancyWeek',
                'hospitalName',
                'walletAmount',
                'verificationStatus', 
                'verificationDate'
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            message: 'Verification records fetched successfully',
            data: {
                patientName,
                pregnancyWeek,
                hospitalName,
                walletAmount,
                verificationStatus, 
                verificationDate
            }
        });
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;
    } catch (error) {
        res.status(500).json({
            message: error.message
        }); 
    }
}
