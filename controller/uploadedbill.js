const { uploadedBill, Mother, Hospital } = require('../models');
const { Op } = require('sequelize');

// Valid enum values from the model
const WORKFLOW_STAGES = ['uploadedBill', 'customerReview', 'fundValidation', 'finalApproval'];
const SYSTEM_VALIDATIONS = ['patienceIdMatched', 'fileUploadedProgress', 'billingVerification', 'requiredFieldComplete'];
const BILL_SUMMARY_FIELDS = ['patienceName', 'category', 'date', 'totalAmount'];

const generateBillNumber = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `BL-${randomNumber}`;
};


// exports.uploadBill = async (req, res) => {
//     try {
//         // Get maternalId from the body (which matches your Swagger body)
//         const { maternalId, referenceNumber, category, amount, billingDate, dueDate } = req.body;

//         // Find the mother using maternalId in the where clause
//         const mother = await Mother.findOne({ where: { maternalId } });
//         if (!mother) {
//             return res.status(404).json({
//                 message: 'Mother not found'
//             });
//         }


// exports.uploadBill = async (req, res) => {
//     try {
//         const { motherId } = req.params;

//         const mother = await Mother.findOne({ where: { maternalId } });
//         if (!mother) {
//             return res.status(404).json({
//                 message: 'Mother not found'
//             });
//         }

//         const hospitalId = req.user.id
//         const hospital = await Hospital.findByPk(hospitalId);
//         if (!hospital) {
//             return res.status(404).json({
//                 message: 'Hospital not found'
//             });
//         }
//         const {
//             referenceNumber,
//             category,
//             amount,
//             billingDate,
//             dueDate
//         } = req.body;

//         // Required field validation (systemValidation: requiredFieldComplete)
//         const requiredFields = { referenceNumber, amount, category, billingDate, dueDate };
//         const missingFields = Object.keys(requiredFields).filter(
//             (field) => requiredFields[field] === undefined || requiredFields[field] === null || requiredFields[field] === ''
//         );

//         if (missingFields.length > 0) {
//             return res.status(400).json({
//                 message: 'Required fields missing',
//                 missingFields,
//                 systemValidation: 'requiredFieldComplete'
//             });
//         }

//         // Auto-fill mother details for the bill
//         const fullName = `${mother.firstName} ${mother.lastName}`;
//         const maternalId = mother.maternalId || null;
//         const phoneNumber = mother.phoneNumber || null;

//         // Get expectedDeliveryDate from the latest MotherUpdate
//         const { MotherUpdate } = require('../models');
//         const latestUpdate = await MotherUpdate.findOne({
//             where: { motherId: mother.id },
//             attributes: ['estimatedDueDate'],
//             order: [['createdAt', 'DESC']]
//         });
//         const expectedDeliveryDate = latestUpdate?.estimatedDueDate || null;

//         // Capture uploaded document (systemValidation: fileUploadedProgress)
//         const documentUpload = req.file
//             ? `/uploads/bills/${req.file.filename}`
//             : (req.files?.documentUpload?.[0]
//                 ? `/uploads/bills/${req.files.documentUpload[0].filename}`
//                 : null);

//         if (!documentUpload) {
//             return res.status(400).json({
//                 message: 'Bill document is required',
//                 systemValidation: 'fileUploadedProgress'  
//             });
//         }

//         // Generate a unique bill ID
//         const billId = `BILL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

//         // Create bill and kick off the workflow at stage 1
//         const bill = await uploadedBill.create({
//             // billId,
//             hospitalId: hospital.id,
//             motherId: mother.id,
//             fullName: `${mother.firstName} ${mother.lastName}`,
//             email: mother.email,
//             maternalId: mother.maternalId || null,
//             phoneNumber: mother.phoneNumber,
//             pregnancyWeek: latestUpdate?.currentPregnancyWeek || null,
//             expectedDeliveryDate: latestUpdate?.estimatedDueDate || null,
//             preferredHospital: mother.Hospital?.hospitalName || null,
//             category,
//             amount,
//             billingDate,
//             dueDate,
//             verificationWorkFlow: 'uploadedBill',
//             systemValidation: 'fileUploadedProgress',
//             billSummary: 'patienceName',
//             documentUpload,
//             billNumber: generateBillNumber()
//         });

//         // console.log('Bill created:', bill);

//         res.status(201).json({
//             message: 'Bill uploaded successfully and entered customer review',
//             data: bill,
//             workflow: {
//                 currentStage: bill.verificationWorkFlow,
//                 nextStage: 'customerReview'
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };

exports.uploadBill = async (req, res) => {
    try {
        // 1. Get mother identifier and other fields from req.body
        const {
            maternalId,
            motherId,
            referenceNumber,
            category,
            amount,
            billingDate,
            dueDate
        } = req.body;

      
        const motherIdValue = maternalId || motherId || req.params.motherId;

        let mother;
        if (motherIdValue) {
            // Try by maternalId (string) first, then by primary key (UUID)
            mother = await Mother.findOne({ where: { maternalId: motherIdValue } });
            if (!mother) {
                mother = await Mother.findByPk(motherIdValue);
            }
        }

        if (!mother) {
            return res.status(404).json({
                message: 'Mother not found'
            });
        }

        const hospitalId = req.user.id;
        const hospital = await Hospital.findByPk(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }

        // Required field validation (systemValidation: requiredFieldComplete)
        const requiredFields = { referenceNumber, amount, category, billingDate, dueDate };
        const missingFields = Object.keys(requiredFields).filter(
            (field) => requiredFields[field] === undefined || requiredFields[field] === null || requiredFields[field] === ''
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Required fields missing',
                missingFields,
                systemValidation: 'requiredFieldComplete'
            });
        }

        // Get expectedDeliveryDate from the latest MotherUpdate
        const { MotherUpdate } = require('../models');
        const latestUpdate = await MotherUpdate.findOne({
            where: { motherId: mother.id },
            attributes: ['estimatedDueDate'],
            order: [['createdAt', 'DESC']]
        });
        const expectedDeliveryDate = latestUpdate?.estimatedDueDate || null;

        // Capture uploaded document (systemValidation: fileUploadedProgress)
        const documentUpload = req.file
            ? `/uploads/bills/${req.file.filename}`
            : (req.files?.documentUpload?.[0]
                ? `/uploads/bills/${req.files.documentUpload[0].filename}`
                : null);

        if (!documentUpload) {
            return res.status(400).json({
                message: 'Bill document is required',
                systemValidation: 'fileUploadedProgress'  
            });
        }

        // Generate a unique bill ID (required by the database schema)
        const generatedBillId = `BILL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Validate category against allowed ENUM values
        const allowedCategories = ['Natural Delivery', 'C section'];
        const validCategory = allowedCategories.includes(category) ? category : 'Natural Delivery';

        // Create bill and kick off the workflow at stage 1
        const bill = new uploadedBill({
            billId: generatedBillId,
            hospitalId: hospital.id,
            motherId: mother.id,
            fullName: `${mother.firstName} ${mother.lastName}`,
            email: mother.email,
            maternalId: mother.maternalId || null,
            phoneNumber: mother.phoneNumber,
            pregnancyWeek: latestUpdate?.currentPregnancyWeek || null,
            expectedDeliveryDate,
            preferredHospital: mother.Hospital?.hospitalName || null,
            category: validCategory,
            amount,
            billingDate,
            dueDate,
            verificationWorkFlow: 'uploadedBill',
            systemValidation: 'fileUploadedProgress',
            billSummary: 'patienceName',
            documentUpload,
            billNumber: generateBillNumber()
        });
        await bill.save();
        res.status(201).json({
            message: 'Bill uploaded successfully and entered customer review',
            data: bill,
            workflow: {
                currentStage: bill.verificationWorkFlow,
                nextStage: 'customerReview'
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};


exports.customerReview = async (req, res) => {
    try {
        const { billId } = req.params;
        const { approved } = req.body;
        const hospitalId = req.user.id;

        const bill = await uploadedBill.findOne({
            where: {
                id: billId,
                hospitalId
            }
        });
        if (!bill) {
            return res.status(404).json({
                message: 'Bill not found for this hospital'
            });
        }

        if (bill.verificationWorkFlow !== 'uploadedBill') {
            return res.status(400).json({
                message: `Bill is currently at '${bill.verificationWorkFlow}' stage. Customer review can only happen after 'uploadedBill'.`
            });
        }

        if (approved === false) {
            // Patient rejected the bill - stop the workflow
            return res.status(200).json({
                message: 'Bill rejected by customer. Workflow halted.',
                data: bill
            });
        }

        // Move to fund validation
        bill.verificationWorkFlow = 'customerReview';
        bill.systemValidation = 'billingVerification';
        await bill.save();

        res.status(200).json({
            message: 'Bill accepted by customer. Proceeding to fund validation.',
            data: bill,
            workflow: {
                currentStage: bill.verificationWorkFlow,
                nextStage: 'fundValidation'
            }
        });
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({
            message: error.message
        });
    }
};


exports.validateFunds = async (req, res) => {
    try {
        const { billId } = req.params;
        const hospitalId = req.user.id;

        const bill = await uploadedBill.findOne({
            where: {
                id: billId,
                hospitalId
            }
        });
        if (!bill) {
            return res.status(404).json({
                message: 'Bill not found for this hospital'
            });
        }

        if (bill.verificationWorkFlow !== 'customerReview') {
            return res.status(400).json({
                message: `Bill is at '${bill.verificationWorkFlow}' stage. Fund validation requires 'customerReview' stage.`
            });
        }

        const mother = await Mother.findOne({ where: { id: bill.maternalId } });
        if (!mother) {
            return res.status(404).json({
                message: 'Mother record not found for this bill'
            });
        }

        const currentBalance = Number(mother.currentBalance) || 0;
        const billAmount = Number(bill.amount) || 0;

        bill.verificationWorkFlow = 'fundValidation';

        if (currentBalance < billAmount) {
            await bill.save();
            return res.status(200).json({
                message: 'Insufficient funds. Bill cannot proceed to final approval.',
                data: bill,
                fundCheck: {
                    billAmount,
                    currentBalance,
                    shortfall: billAmount - currentBalance
                }
            });
        }

        await bill.save();

        res.status(200).json({
            message: 'Fund validation passed. Bill is ready for final approval.',
            data: bill,
            fundCheck: {
                billAmount,
                currentBalance,
                remainingAfterPayment: currentBalance - billAmount
            },
            workflow: {
                currentStage: bill.verificationWorkFlow,
                nextStage: 'finalApproval'
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};


exports.finalApproval = async (req, res) => {
    try {
        const { billId } = req.params;
        const { approved } = req.body;
        const hospitalId = req.user.id;

        const bill = await uploadedBill.findOne({
            where: {
                id: billId,
                hospitalId
            }
        });
        if (!bill) {
            return res.status(404).json({
                message: 'Bill not found for this hospital'
            });
        }

        if (bill.verificationWorkFlow !== 'fundValidation') {
            return res.status(400).json({
                message: `Bill is at '${bill.verificationWorkFlow}' stage. Final approval requires 'fundValidation' stage.`
            });
        }

        if (approved === false) {
            return res.status(200).json({
                message: 'Bill final approval denied.',
                data: bill
            });
        }

        bill.verificationWorkFlow = 'finalApproval';
        bill.systemValidation = 'requiredFieldComplete';
        await bill.save();

        res.status(200).json({
            message: 'Bill has received final approval. Workflow complete.',
            data: bill,
            workflow: {
                currentStage: bill.verificationWorkFlow,
                completed: true
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};


exports.getBillStatus = async (req, res) => {
    try {
        const { billId } = req.params;
        const hospitalId = req.user.id;

        const bill = await uploadedBill.findOne({
            where: {
                id: billId,
                hospitalId
            }
        });
        if (!bill) {
            return res.status(404).json({
                message: 'Bill not found for this hospital'
            });
        }

        const stageIndex = WORKFLOW_STAGES.indexOf(bill.verificationWorkFlow);
        const completedStages = WORKFLOW_STAGES.slice(0, stageIndex + 1);
        const remainingStages = WORKFLOW_STAGES.slice(stageIndex + 1);

        res.status(200).json({
            message: 'Bill status retrieved',
            data: {
                billNumber: bill.billNumber,
                fullName: bill.fullName,
                maternalId: bill.maternalId,
                referenceNumber: bill.referenceNumber,
                amount: bill.amount,
                verificationWorkFlow: bill.verificationWorkFlow,
                systemValidation: bill.systemValidation,
                completedStages,
                remainingStages,
                isComplete: bill.verificationWorkFlow === 'finalApproval'
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};


exports.getBillSummary = async (req, res) => {
    try {
        const { billId } = req.params;
        const hospitalId = req.user.id;

        const bill = await uploadedBill.findOne({
            where: {
                id: billId,
                hospitalId
            }
        });
        if (!bill) {
            return res.status(404).json({
                message: 'Bill not found for this hospital'
            });
        }

        // Allow override via query, otherwise fall back to the stored billSummary value
        const requestedType = summaryType || bill.billSummary;

        if (!BILL_SUMMARY_FIELDS.includes(requestedType)) {
            return res.status(400).json({
                message: `Invalid summary type. Allowed: ${BILL_SUMMARY_FIELDS.join(', ')}`
            });
        }

        const summaryMap = {
            patienceName: { fullName: bill.fullName },
            category: { category: bill.category },
            date: { billingDate: bill.billingDate, dueDate: bill.dueDate },
            totalAmount: { amount: bill.amount }
        };

        // Persist the chosen summary type back on the bill
        bill.billSummary = requestedType;
        await bill.save();

        res.status(200).json({
            message: 'Bill summary retrieved',
            summaryType: requestedType,
            data: summaryMap[requestedType]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Run a system validation check against a bill.
 * validationType must be one of: patienceIdMatched, fileUploadedProgress,
 * billingVerification, requiredFieldComplete
 */
exports.runSystemValidation = async (req, res) => {
    try {
        const { billId } = req.params;
        const { validationType } = req.body;
        const hospitalId = req.user.id;

        const bill = await uploadedBill.findOne({
            where: {
                id: billId,
                hospitalId
            }
        });
        if (!bill) {
            return res.status(404).json({
                message: 'Bill not found'
            });
        }

        if (!SYSTEM_VALIDATIONS.includes(validationType)) {
            return res.status(400).json({
                message: `Invalid validation type. Allowed: ${SYSTEM_VALIDATIONS.join(', ')}`
            });
        }

        let passed = false;
        let detail = {};

        switch (validationType) {
            case 'patienceIdMatched': {
                const mother = await Mother.findOne({ where: { id: bill.maternalId } });
                passed = Boolean(mother);
                detail = { matched: passed };
                break;
            }
            case 'fileUploadedProgress': {
                passed = Boolean(bill.documentUpload);
                detail = { documentUpload: bill.documentUpload };
                break;
            }
            case 'billingVerification': {
                passed = Boolean(bill.amount && bill.billingDate && bill.dueDate);
                detail = {
                    hasAmount: Boolean(bill.amount),
                    hasBillingDate: Boolean(bill.billingDate),
                    hasDueDate: Boolean(bill.dueDate)
                };
                break;
            }
            case 'requiredFieldComplete': {
                const required = ['referenceNumber', 'amount', 'category', 'billingDate', 'dueDate'];
                const missing = required.filter((f) => !bill[f]);
                passed = missing.length === 0;
                detail = { missingFields: missing };
                break;
            }
        }

        if (passed) {
            bill.systemValidation = validationType;
            await bill.save();
        }

        res.status(200).json({
            message: passed ? 'System validation passed' : 'System validation failed',
            validationType,
            passed,
            detail
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Re-export the dashboard helper that was already stubbed in this file
// exports.getUploadedBillDashboard = async (req, res) => {
//     try {
//         const { id: hospitalId } = req.user;

//         const bills = await uploadedBill.findAll({
//             where: {},
//             order: [['createdAt', 'DESC']]
//         });

//         const totalUploadedBills = bills.length;
//         const totalVerifiedBills = bills.filter((b) => b.verificationStatus === 'Verified').length;
//         const totalPendingBills =  bills.filter((b) => b.verificationStatus === 'Pending').length;
//         const totalDeliveryCost = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
//         const byStage = WORKFLOW_STAGES.reduce((acc, stage) => {
//             acc[stage] = bills.filter((b) => b.verificationWorkFlow === stage).length;
//             return acc;
//         }, {});

//         res.status(200).json({
//             message: 'Dashboard data retrieved',
//             data: {
//                 totalBills: totalUploadedBills,
//                 totalAmount: totalDeliveryCost,
//                 byStage
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };

exports.getUploadedBillDashboard = async (req, res) => {
    try {
        const { id: hospitalId } = req.user;

        const bills = await uploadedBill.findAll({
            where: {
                hospitalId: hospitalId 
            },
            order: [['createdAt', 'DESC']]
        });

        const totalUploadedBills = bills.length;
        const totalVerifiedBills = bills.filter((b) => b.verificationWorkFlow === 'Verified').length;
        const totalPendingBills = bills.filter((b) => b.verificationWorkFlow !== 'Pending').length;
        const totalDeliveryCost = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

        // Calculate percentages - avoid divide by zero
        const verifiedPercentage = totalUploadedBills > 0 
           ? Math.round((totalVerifiedBills / totalUploadedBills) * 100 * 10) / 10 
            : 0;

        const pendingPercentage = totalUploadedBills > 0 
           ? Math.round((totalPendingBills / totalUploadedBills) * 100 * 10) / 10 
            : 0;

        const byStage = WORKFLOW_STAGES.reduce((acc, stage) => {
            acc[stage] = bills.filter((b) => b.verificationWorkFlow === stage).length;
            return acc;
        }, {});

        res.status(200).json({
            message: 'Dashboard data retrieved',
            data: {
                totalBills: totalUploadedBills,
                verifiedBills: totalVerifiedBills,
                pendingBills: totalPendingBills,
                totalAmount: totalDeliveryCost,
                verifiedPercentage: verifiedPercentage, // 75.0
                pendingPercentage: pendingPercentage, // 16.9
                byStage
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
};




// exports.getUploadedBillRecords = async (req, res) => {
//     try {
//         const { id: hospitalId } = req.user;
//         const { status } = req.query;
//         const whereClause = { hospitalId };

//         if (status) {
//             whereClause.verificationStatus = status;
//         }

//         const records = await uploadedBill.findAll({
//             where: whereClause,
//             order: [['createdAt', 'DESC']],
//             attributes: [
//                 'billId', 
//                 'patientName', 
//                 'deliveryType', 
//                 'billAmount', 
//                 'uploadedDate', 
//                 'verificationStatus', 
//                 'paymentStatus'
//             ],
//             raw: true 
//         });

//         const formattedRecords = records.map(bill => ({
//            ...bill,
//             uploadedDate: new Date(bill.uploadedDate).toISOString().split('T')[0] 
//         }));

//         res.status(200).json({
//             message: 'Bill records retrieved successfully',
//             data: formattedRecords
//         }); 

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };


exports.getUploadedBillRecords = async (req, res) => {
    try {
        const { id: hospitalId } = req.user;

        const { status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = { hospitalId };

        // Fix: use verificationWorkFlow (not verificationStatus which doesn't exist)
        if (status && ['uploadedBill', 'customerReview', 'fundValidation', 'finalApproval'].includes(status)) {
            whereClause.verificationWorkFlow = status;
        }

        const { count, rows } = await uploadedBill.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const formattedRecords = rows.map(record => ({
            billId: record.billId || record.id,
            patientName: record.fullName,
            category: record.category,
            billAmount: record.amount,
            verificationStatus: record.verificationWorkFlow,
            paymentStatus: record.verificationWorkFlow === 'finalApproval' ? 'Paid' : 'Unpaid',
            uploadedDate: record.billingDate || record.createdAt
        }));

        res.status(200).json({
            message: 'Uploaded Bills records fetched successfully',
            data: {
                totalRecords: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)),
                records: formattedRecords
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        }); 
    }
}
