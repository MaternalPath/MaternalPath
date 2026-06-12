const { VerificationHistory, Mother } = require('../models');
const { searchPatient } = require("../controller/hospitalDashBoard");

exports.getHospitalDashboard = async (req, res, next) => {
    try {

        const hospitalId = req.user?.id;

        const totalVerificationRequests = await verificationRequest.countDocuments({
            hospital: hospitalId,
        });

        const pendingAuthorizations = await verificationRequest.countDocuments({
            hospital: hospitalId,
            status: 'pending',
        });

        const approvedRequest = await verificationRequest.countDocuments({
            hospital: hospitalId,
            status: 'approved',
        });

        const declinedRequest = await verificationRequest.countDocuments({
            hospital: hospitalId,
            status: 'declined',
        });

        res.status(200).json({
            totalVerificationRequests,
            pendingAuthorizations,
            approvedRequest,
            declinedRequest
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching dashboard data',
        })
    }
};

exports.searchPatients = async (req, res, next) => {
    try {
        const { search } = req.query;

        const patients = await motherModel.findOne({
            $or: [
                { patientId: search },
                { phoneNumber: search }
            ]
        })
        .populate("hospital");

        if (!patients) {
            return res.status(404).json({   
                message: 'Patient not found'
             });
        }

        const percentage = ( patient.walletBallance/ patient.deliverySavingsGoal) * 100;

        res.status(200).json({
            patientName: patient.fullName,
            patientId: patient.patientId,
            pregnancyStage: patient.pregnancyStage,
            walletBalance: patient.walletBalance,
            deliverySavingsGoal: patient.deliverySavingsGoal,
            preferredHospital:patient.hospital?.hospitalName,
            readinessPercentage: Math.min(Math.round(percentage), 100),
            status: percentage >= 100 ? "Eligible for Admission" : "Not eligible"
        });
    }catch (error) {
        res.status(500).json({
            message: 'Error searching for patient',
        })
    }
}