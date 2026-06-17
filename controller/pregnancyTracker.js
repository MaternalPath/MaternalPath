const { motherUpdate} = require('../models')
exports.firstCard = async (req, res, next) => {
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(404).json({
                message: `mother with ${id} not found`,
            })
        }
        const checkid = await motherUpdate.findOne({
            where: {id}
        })

        const today = Date.now();
        const daysUntilDueDate = checkid.estimatedDueDate - today;
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        })
    }
}