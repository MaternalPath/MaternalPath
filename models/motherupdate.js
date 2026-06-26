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
    trimester: { type: DataTypes.STRING, allowNull: true },
    bloodType: { type: DataTypes.STRING, allowNull: true },
    daysUntilDueDate: { type: DataTypes.INTEGER, allowNull: true },
    pregnancyProgress: { type: DataTypes.INTEGER, allowNull: true },
    existingHealthConditions: { type: DataTypes.STRING, allowNull: true },
    allergies: { type: DataTypes.STRING, allowNull: true },
    currentPregnancyWeek: { type: DataTypes.INTEGER, allowNull: true },
    emergencyContactName: { type: DataTypes.STRING, allowNull: true },
    emergencyContactNumber: { type: DataTypes.STRING, allowNull: true },
    selectedHospital: { type: DataTypes.STRING, allowNull: true },
    hospitalAddress: { type: DataTypes.STRING },
    hospitalContact: { type: DataTypes.STRING },
    estimatedDeliveryCost: { type: DataTypes.STRING },
    savingsGoalAmount: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    weeklyContribution: { type: DataTypes.STRING, allowNull: true },
    linkedPaymentMethod: { type: DataTypes.STRING, allowNull: true },
    estimatedDueDate: { type: DataTypes.STRING, allowNull: true },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'MotherUpdate',
    tableName: 'motherUpdates'
  });

  return MotherUpdate;
};
