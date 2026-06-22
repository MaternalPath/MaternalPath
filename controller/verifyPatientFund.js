const { verifyPatientFund, Mother, Hospital, MotherUpdate } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new patient fund verification request
 */
exports.createVerificationRequest = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { maternalId, notes } = req.body;

    if (!maternalId) {
      return res.status(400).json({
        message: 'maternalId is required'
      });
    }

    // Verify hospital exists
    const hospital = await Hospital.findByPk(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        message: 'Hospital not found'
      });
    }

    // Verify mother exists and belongs to this hospital
    const mother = await Mother.findOne({
      where: {
        id: maternalId,
        hospitalId
      }
    });

    if (!mother) {
      return res.status(404).json({
        message: 'Mother not found for this hospital'
      });
    }

    // Get the latest mother update for pregnancy info
    const motherUpdate = await MotherUpdate.findOne({
      where: { motherId: mother.id },
      order: [['createdAt', 'DESC']]
    });

    // Check if there's already a pending verification for this mother
    const existingPending = await verifyPatientFund.findOne({
      where: {
        maternalId,
        hospitalId,
        status: 'Pending'
      }
    });

    if (existingPending) {
      return res.status(409).json({
        message: 'A pending verification request already exists for this patient'
      });
    }

    const pregnancyWeek = motherUpdate ? motherUpdate.currentPregnancyWeek || 0 : 0;
    const dueDate = motherUpdate && motherUpdate.estimatedDueDate
      ? new Date(motherUpdate.estimatedDueDate)
      : new Date();
    const savingsGoal = motherUpdate ? parseInt(motherUpdate.savingsGoalAmount) || 100000 : 100000;

    // Create the verification request
    const verification = await verifyPatientFund.create({
      patientName: `${mother.firstName} ${mother.lastName}`,
      maternalId: mother.id,
      hospitalId,
      hospitalName: hospital.hospitalName,
      pregnancyWeek,
      dueDate,
      walletBalance: 0,
      savingsGoal,
      goalPercentage: 0,
      status: 'Pending',
      readiness: 'Just Started',
      notes: notes || null
    });

    res.status(201).json({
      message: 'Verification request created successfully',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating verification request',
      error: error.message
    });
  }
};



exports.getVerificationRequests = async (req, res) => {
  try {
    const hospitalId = req.user.id; 
    const { status, page = 1, limit = 20 } = req.query;

    const where = { hospitalId };
    if (status) {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await verifyPatientFund.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Mother,
          as: 'mother',
          attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] }
        }
      ]
    });

    res.status(200).json({
      message: 'Verification requests retrieved successfully',
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching verification requests',
      error: error.message
    });
  }
};



exports.getVerificationRequest = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { id } = req.params;

    const verification = await verifyPatientFund.findOne({
      where: {
        id,
        hospitalId
      },
      include: [
        {
          model: Mother,
          as: 'mother',
          attributes: { exclude: ['password', 'otp', 'otpExpiresAt'] }
        }
      ]
    });

    if (!verification) {
      return res.status(404).json({
        message: 'Verification request not found'
      });
    }

    res.status(200).json({
      message: 'Verification request retrieved successfully',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching verification request',
      error: error.message
    });
  }
};



exports.approveVerificationRequest = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;

    const verification = await verifyPatientFund.findOne({
      where: {
        id,
        hospitalId,
        status: 'Pending'
      }
    });

    if (!verification) {
      return res.status(404).json({
        message: 'Pending verification request not found'
      });
    }

    verification.status = 'Approved';
    verification.verifiedBy = req.user.email || req.user.id;
    verification.verifiedAt = new Date();
    if (notes) verification.notes = notes;

    await verification.save();

    res.status(200).json({
      message: 'Verification request approved successfully',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error approving verification request',
      error: error.message
    });
  }
};


exports.rejectVerificationRequest = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        message: 'Notes are required when rejecting a verification request'
      });
    }

    const verification = await verifyPatientFund.findOne({
      where: {
        id,
        hospitalId,
        status: 'Pending'
      }
    });

    if (!verification) {
      return res.status(404).json({
        message: 'Pending verification request not found'
      });
    }

    verification.status = 'Rejected';
    verification.verifiedBy = req.user.email || req.user.id;
    verification.verifiedAt = new Date();
    verification.notes = notes;

    await verification.save();

    res.status(200).json({
      message: 'Verification request rejected successfully',
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting verification request',
      error: error.message
    });
  }
};

exports.getVerificationHistory = async (req, res) => {
  
}