module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Mother extends Model {
    static associate(models) {
      // Define associations here using the 'models' object passed by Sequelize
      Mother.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        as: 'Hospital'
      });
    }
  }

  Mother.init({
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
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.STRING },
    estimatedDueDate: { type: DataTypes.STRING },
    trimester: { type: DataTypes.STRING },
    bloodType: { type: DataTypes.STRING },
    existingHealthConditions: { type: DataTypes.STRING },
    allergies: { type: DataTypes.STRING },
    currentPregnancyWeek: { type: DataTypes.INTEGER },
    emergencyContact: { type: DataTypes.STRING },
    selectedHospital: { type: DataTypes.STRING },
    hospitalAddress: { type: DataTypes.STRING },
    hospitalContact: { type: DataTypes.STRING },
    estimatedDeliveryCost: { type: DataTypes.STRING },
    savingsGoalAmount: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    currentBalance: { type: DataTypes.STRING },
    weeklyContribution: { type: DataTypes.STRING },
    linkedPaymentMethod: { type: DataTypes.STRING },
    estimatedDueDate: { type: DataTypes.STRING },
    amount: { type: DataTypes.INTEGER }, 
    otp: { type: DataTypes.STRING },    
    otpExpiresAt: { type: DataTypes.DATE },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    isUpdated: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, enum: ['mother','admin', 'hospital'],defaultValue: 'mother' },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'Mother',
    tableName: 'mothers'
  });

  return Mother;
};
