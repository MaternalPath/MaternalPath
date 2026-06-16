module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Mother extends Model {
    static associate(models) {
      // Define associations here using the 'models' object passed by Sequelize
      Mother.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        as: 'Hospital'
      });
       Mother.hasMany(models.payment, {
    foreignKey: 'motherId',
    as: 'payments'
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
    maternalId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING },    
    otpExpiresAt: { type: DataTypes.DATE },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    isUpdated: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, enum: ['mother','admin', 'hospital'],defaultValue: 'mother' },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0  
    },
    lockUntil: {
        type: DataTypes.DATE
    },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'Mother',
    tableName: 'mothers'
  });

  return Mother;
};
