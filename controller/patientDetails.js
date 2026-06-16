const { Mother, MotherUpdate, Hospital } = require('../models');

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
