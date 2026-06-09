const {firsttrimester} = require("../models");


exports.createFirst = async (req, res, next) => {
    try {
        const {
            whatToExpect,
            nutritionGuidiance
        } = req.body;
        const trimester = await firsttrimester.create({
            whatToExpect,
            nutritionGuidiance
        });

        res.status(201).json({
      message: "Information created successfully",
      data,
    });
    } catch (error) {
        next({
      message: error.message,
      statusCode: 500,
    });
    }
}