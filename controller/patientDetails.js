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


exports.getPatientDashboard = async (req, res, next) => {
    try {
        const motherId = req.user?.id;

        if (!motherId) {
            return res.status(401).json({
                message: "Invalid or missing user ID",
            });
        }

        // 1. Fixed: Use motherId, not patientId. Use consistent variable name
        const motherUpdate = await MotherUpdate.findOne({
            where: { motherId },
            order: [['createdAt', 'DESC']]
        });

        if (!motherUpdate) {
            return res.status(404).json({
                message: "Patient record not found"
            });
        }

        // 2. Get wallet record
        const walletRecord = await wallet.findOne({
            where: { motherId }
        });

        // 3. Wallet calculations
        const savingsGoal = Number(motherUpdate.savingsGoalAmount) || 0;
        const currentSavings = Number(walletRecord?.currentBalance) || 0;
        const remainingAmount = savingsGoal - currentSavings;
        const savingsProgress = savingsGoal > 0 
            ? Math.round((currentSavings / savingsGoal) * 1000) / 10 
            : 0;

        // 4. Get last verification record
        const lastVerification = await verifyPatientFund.findOne({
            where: { maternalId: motherId },
            attributes: ['status', 'verifiedAt', 'notes', 'readiness'],
            order: [['createdAt', 'DESC']]
        });

        // 5. Get recent bills
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

        // 6. Construct response
        const walletSummary = {
            savingsGoal,
            currentSavings,
            remainingAmount: remainingAmount > 0 ? remainingAmount : 0,
            savingsProgress: savingsProgress + '%'
        };

        const pregnancySummary = {
            currentWeek: motherUpdate.currentPregnancyWeek, // fixed
            expectedDelivery: motherUpdate.estimatedDueDate, // fixed
            preferredHospital: motherUpdate.selectedHospital, // fixed
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
            message: 'Patient dashboard retrieved successfully',
            wallet: walletSummary,
            pregnancy: pregnancySummary,
            recentBills: recentBillsSummary
        });

    } catch (error) {
        console.log('Dashboard Error:', error); // Add this to see actual error
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
};
