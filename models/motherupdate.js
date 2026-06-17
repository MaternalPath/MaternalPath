module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class MotherUpdate extends Model {
    static associate(models) {
      // Define associations here using the 'models' object passed by Sequelize
      MotherUpdate.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        as: 'Hospital'
      });
      MotherUpdate.belongsTo(models.Mother, {
        foreignKey: 'motherId',
        as: 'Mother'
      });
       MotherUpdate.hasMany(models.payment, {
    foreignKey: 'motherId',
    as: 'payments'
  });
    }
  }

  MotherUpdate.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    hospitalId: {
      type: DataTypes.UUID,
      references: {
        model: "Hospital",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    motherId: {
      type: DataTypes.UUID,
      references: {
        model: "Mother",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    dateOfBirth: { type: DataTypes.STRING, allowNull: false },
    estimatedDueDate: { type: DataTypes.STRING, allowNull: false },
    image: {
        type: DataTypes.STRING,
        allowNull: false
      },
      imagePublicId: {
        type: DataTypes.STRING,
        allowNull: false
      },
    trimester: { type: DataTypes.STRING, allowNull: false },
    bloodType: { type: DataTypes.STRING, allowNull: false },
    daysUntilDueDate: { type: DataTypes.INTEGER, allowNull: false },
    pregnancyProgress: { type: DataTypes.INTEGER, allowNull: false },
    existingHealthConditions: { type: DataTypes.STRING, allowNull: false },
    allergies: { type: DataTypes.STRING, allowNull: false },
    currentPregnancyWeek: { type: DataTypes.INTEGER, allowNull: false },
    emergencyContactName: { type: DataTypes.STRING, allowNull: false },
    emergencyContactNumber: { type: DataTypes.INTEGER, allowNull: false },
    selectedHospital: { type: DataTypes.STRING, allowNull: false },
    hospitalAddress: { type: DataTypes.STRING },
    hospitalContact: { type: DataTypes.STRING },
    estimatedDeliveryCost: { type: DataTypes.STRING },
    savingsGoalAmount: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    weeklyContribution: { type: DataTypes.STRING, allowNull: false },
    linkedPaymentMethod: { type: DataTypes.STRING, allowNull: false },
    estimatedDueDate: { type: DataTypes.STRING, allowNull: false },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'MotherUpdate',
    tableName: 'motherUpdates'
  });

  return MotherUpdate;
};
