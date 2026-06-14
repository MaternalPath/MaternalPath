const { verifyPatientFund, Mother, Hospital, payment, MotherUpdate } = require('../models');
const { Op } = require('sequelize');

/**
 * Get hospital dashboard statistics
 * Returns counts of verification requests grouped by status
 */
exports.getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    // Verify hospital exists
    const hospital = await Hospital.findByPk(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        message: 'Hospital not found'
      });
    }

    // Get all verification requests for this hospital
    const totalVerificationRequests = await verifyPatientFund.count({
      where: { hospitalId }
    });

    const pendingAuthorizations = await verifyPatientFund.count({
      where: {
        hospitalId,
        status: 'Pending'
      }
    });

    const approvedRequest = await verifyPatientFund.count({
      where: {
        hospitalId,
        status: 'Approved'
      }
    });

    const declinedRequest = await verifyPatientFund.count({
      where: {
        hospitalId,
        status: 'Rejected'
      }
    });

    res.status(200).json({
      message: 'Dashboard data retrieved successfully',
      totalVerificationRequests,
      pendingAuthorizations,
      approvedRequest,
      declinedRequest
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

/**
 * Search for a mother by mother ID or phone number
 */
exports.searchMothers = async (req, res) => {
  try {
    const { search } = req.query;
    const hospitalId = req.user.id;

    if (!search) {
      return res.status(400).json({
        message: 'Search query parameter is required'
      });
    }

    // Search for mother by mother ID (id) or phone number
    const mother = await Mother.findOne({
      where: {
        [Op.or]: [
          { id: search },
          { phoneNumber: search }
        ],
        hospitalId
      },
      attributes: {
        exclude: ['password', 'otp', 'otpExpiresAt']
      }
    });

    if (!mother) {
      return res.status(404).json({
        message: 'Mother not found'
      });
    }

    // Get the patient's latest update record for pregnancy stage/trimester info
    const motherUpdate = await MotherUpdate.findOne({
      where: { motherId: mother.id },
      order: [['createdAt', 'DESC']]
    });

    // Get the patient's verification fund record if it exists
    let verificationFund = await verifyPatientFund.findOne({
      where: { maternalId: mother.id },
      order: [['createdAt', 'DESC']]
    });

    // If no verification fund record exists, create one from motherUpdate data
    if (!verificationFund && motherUpdate) {
      const hospital = await Hospital.findByPk(hospitalId);
      verificationFund = await verifyPatientFund.create({
        patientName: `${mother.firstName} ${mother.lastName}`,
        maternalId: mother.id,
        hospitalId,
        hospitalName: hospital ? hospital.hospitalName : '',
        pregnancyWeek: motherUpdate.currentPregnancyWeek || 0,
        dueDate: motherUpdate.estimatedDueDate ? new Date(motherUpdate.estimatedDueDate) : new Date(),
        walletBalance: 0,
        savingsGoal: parseInt(motherUpdate.savingsGoalAmount) || 100000,
        goalPercentage: 0,
        status: 'Pending',
        readiness: 'Just Started'
      });
    }

    // Get wallet balance from payments
    const payments = await payment.findAll({
      where: { motherId: mother.id },
      attributes: ['amount', 'status']
    });

    const totalPaid = payments
      .filter(p => p.status === 'successful' || p.status === 'completed')
      .reduce((sum, p) => sum + (parseInt(p.amount) || 0), 0);

    const deliverySavingsGoal = verificationFund ? verificationFund.savingsGoal : (motherUpdate ? parseInt(motherUpdate.savingsGoalAmount) || 100000 : 100000);
    const walletBalance = verificationFund ? verificationFund.walletBalance : totalPaid;
    const readinessPercentage = deliverySavingsGoal > 0
      ? Math.min(Math.round((walletBalance / deliverySavingsGoal) * 100), 100)
      : 0;

    // Determine eligibility status
    let status = 'Not eligible';
    if (readinessPercentage >= 100) {
      status = 'Fully eligible';
    } else if (readinessPercentage >= 50) {
      status = 'Partially eligible';
    }

    const hospitalData = await Hospital.findByPk(mother.hospitalId, {
      attributes: ['hospitalName']
    });

    // Extract pregnancy info from motherUpdate if available
    const pregnancyStage = motherUpdate ? motherUpdate.trimester || 'unknown' : 'unknown';
    const pregnancyWeek = motherUpdate ? motherUpdate.currentPregnancyWeek || 0 : 0;

    res.status(200).json({
      patientName: `${mother.firstName} ${mother.lastName}`,
      patientId: mother.id,
      pregnancyStage,
      pregnancyWeek,
      walletBalance,
      deliverySavingsGoal,
      preferredHospital: hospitalData ? hospitalData.hospitalName : 'N/A',
      readinessPercentage,
      status
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error searching for patient',
      error: error.message
    });
  }
};