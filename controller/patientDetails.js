const { Mother, MotherUpdate, Hospital, wallet, uploadedBill, verifyPatientFund } = require('../models');

exports.getPatientDetails = async (req, res, next) => {
    try {
        const { motherId } = req.params;

        const mother = await Mother.findByPk(motherId, {
            attributes: [
                'id',
                'maternalId',
                'firstName',
                'lastName',
                'email',
                'phoneNumber',
                'hospitalId'
            ],
            include: [
                {
                    model: Hospital,
                    as: 'Hospital',
                    attributes: ['hospitalName']
                }
            ]
        });

        if (!mother) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        // Get the latest MotherUpdate for pregnancy data
        const latestUpdate = await MotherUpdate.findOne({
            where: { motherId },
            attributes: ['currentPregnancyWeek', 'estimatedDueDate'],
            order: [['createdAt', 'DESC']]
        });

        const response = {
            id: mother.id,
            fullName: `${mother.firstName} ${mother.lastName}`,
            phoneNumber: mother.phoneNumber,
            email: mother.email,
            maternalId: mother.maternalId || null,
            pregnancyWeek: latestUpdate?.currentPregnancyWeek || null,
            expectedDeliveryDate: latestUpdate?.estimatedDueDate || null,
            preferredHospital: mother.Hospital?.hospitalName || null
        };

        res.status(200).json(response);

    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
};

exports.getMotherDashboard = async (req, res, next) => {
    try {
        const motherId = req.user?.id;

        if (!motherId) {
            return next({
                statusCode: 401,
                message: "Invalid or missing user ID",
            });
        }

        // Get pregnancy info from MotherUpdate
        const motherUpdate = await MotherUpdate.findOne({
            where: { motherId },
            order: [['createdAt', 'DESC']]
        });

        if (!motherUpdate) {
            return next({
                statusCode: 404,
                message: "Mother record not found"
            });
        }

        // Get wallet record
        const walletRecord = await wallet.findOne({
            where: { motherId }
        });

        // Wallet summary calculations
        const savingsGoal = Number(motherUpdate.savingsGoalAmount) || 0;
        const currentSavings = walletRecord?.currentBalance || 0;
        const remainingAmount = savingsGoal - currentSavings;
        const savingsProgress = savingsGoal > 0 
            ? Math.round((currentSavings / savingsGoal) * 100 * 10) / 10 
            : 0;

        // Get last verification record for this mother
        const lastVerification = await verifyPatientFund.findOne({
            where: { maternalId: motherId },
            attributes: ['status', 'verifiedAt', 'notes', 'readiness'],
            order: [['createdAt', 'DESC']]
        });

        // Get recent bills - what the money from her balance was used for
        const recentBills = await uploadedBill.findAll({
            where: { motherId },
            attributes: [
                'billNumber',
                'category',
                'amount',
                'billingDate',
                'dueDate',
                'verificationWorkFlow'
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Construct response
        const walletSummary = {
            savingsGoal,
            currentSavings,
            remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
            savingsProgress: savingsProgress + '%'
        };

        const pregnancySummary = {
            currentWeek: motherUpdate.currentPregnancyWeek,
            expectedDelivery: motherUpdate.estimatedDueDate,
            preferredHospital: motherUpdate.selectedHospital,
            lastVerification: lastVerification ? {
                status: lastVerification.status,
                verifiedAt: lastVerification.verifiedAt,
                readiness: lastVerification.readiness
            } : null
        };

        const recentBillsSummary = recentBills.map(bill => ({
            billNumber: bill.billNumber,
            category: bill.category,
            amount: bill.amount,
            billingDate: bill.billingDate,
            dueDate: bill.dueDate,
            status: bill.verificationWorkFlow
        }));

        res.status(200).json({
            message: 'Mother dashboard retrieved successfully',
            wallet: walletSummary,
            pregnancy: pregnancySummary,
            recentBills: recentBillsSummary
        });

    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
};