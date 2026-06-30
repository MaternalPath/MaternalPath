const { verifyPatientFund, Mother, wallet, MotherUpdate } = require('../models');
const { Op } = require('sequelize');

const generateVerificationNumber = () => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
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
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
            whereClause.status = status;
        }

        if (req.user?.role === 'hospital') {
            whereClause.hospitalId = req.user.id;
        }

        const { count, rows } = await verifyPatientFund.findAndCountAll({
            where: whereClause,
            attributes: [
                'maternalId',
                'patientName',
                'pregnancyWeek',
                'hospitalName',
                'preferredHospital',
                'walletBalance',
                'status',
                'createdAt'
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        for (const record of rows) {
            const walletRecord = await wallet.findOne({ where: { motherId: record.maternalId } });
            const motherUpdate = await MotherUpdate.findOne({
                where: { motherId: record.maternalId },
                order: [['createdAt', 'DESC']]
            });
            
            const currentBalance = walletRecord ? (walletRecord.currentBalance || 0) : 0;
            const savingsGoal = motherUpdate ? (parseInt(motherUpdate.savingsGoalAmount) || 100000) : 100000;
            const goalPercentage = savingsGoal > 0 ? Math.min(Math.round((currentBalance * 100) / savingsGoal), 100) : 0;
            
            if (record.walletBalance !== currentBalance) {
                record.walletBalance = currentBalance;
                record.savingsGoal = savingsGoal;
                record.goalPercentage = goalPercentage;
                await record.save();
            }
        }

        const formattedRecords = rows.map(record => ({
            verificationNumber: generateVerificationNumber(),
            patientName: record.patientName,
            pregnancyWeek: record.pregnancyWeek,
            hospitalName: record.hospitalName,
            preferredHospital: record.preferredHospital,
            walletAmount: record.walletBalance,
            verificationStatus: record.status,
            verificationDate: record.createdAt
        }));

        res.status(200).json({
            message: 'Verification records fetched successfully',
            data: {
                totalRecords: count,
                currentPage: Number(page),
                totalPages: Math.ceil(count / limit),
                records: formattedRecords
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        }); 
    }
}

exports.getVerificationHistories = async (req, res) => {
    try {
        const hospitalId = req.user?.id;
        const { search, status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause - always scope to the authenticated hospital
        const whereClause = { hospitalId };

        // Filter by status if provided
        if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
            whereClause.status = status;
        }

        // Search by patient name or hospital name
        if (search) {
            whereClause[Op.or] = [
                { patientName: { [Op.like]: `%${search}%` } },
                { hospitalName: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await verifyPatientFund.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        for (const record of rows) {
            const walletRecord = await wallet.findOne({ where: { motherId: record.maternalId } });
            const motherUpdate = await MotherUpdate.findOne({
                where: { motherId: record.maternalId },
                order: [['createdAt', 'DESC']]
            });
            
            const currentBalance = walletRecord ? (walletRecord.currentBalance || 0) : 0;
            const savingsGoal = motherUpdate ? (parseInt(motherUpdate.savingsGoalAmount) || 100000) : 100000;
            const goalPercentage = savingsGoal > 0 ? Math.min(Math.round((currentBalance * 100) / savingsGoal), 100) : 0;
            
            if (record.walletBalance !== currentBalance || record.savingsGoal !== savingsGoal || record.goalPercentage !== goalPercentage) {
                record.walletBalance = currentBalance;
                record.savingsGoal = savingsGoal;
                record.goalPercentage = goalPercentage;
                await record.save();
            }
        }

        const formattedRecords = rows.map(record => ({
            id: record.id,
            patientName: record.patientName,
            maternalId: record.maternalId,
            hospitalName: record.hospitalName,
            pregnancyWeek: record.pregnancyWeek,
            dueDate: record.dueDate,
            walletBalance: record.walletBalance,
            savingsGoal: record.savingsGoal,
            goalPercentage: record.goalPercentage,
            status: record.status,
            readiness: record.readiness,
            notes: record.notes,
            verifiedBy: record.verifiedBy,
            verifiedAt: record.verifiedAt,
            date: record.createdAt
        }));

        res.status(200).json({
            message: 'Verification histories fetched successfully',
            data: {
                totalRecords: count,
                currentPage: Number(page),
                totalPages: Math.ceil(count / limit),
                records: formattedRecords
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};