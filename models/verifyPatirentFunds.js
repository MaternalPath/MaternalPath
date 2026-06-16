'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class verifyPatientFund extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      verifyPatientFund.belongsTo(models.Mother, {
        foreignKey: 'maternalId',
        targetKey: 'id',
        as: 'mother'
      });
      verifyPatientFund.belongsTo(models.Hospital, {
        foreignKey: 'hospitalId',
        targetKey: 'id',
        as: 'hospital'
      });
    }
  }
  verifyPatientFund.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maternalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'mothers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Hospitals',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    hospitalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pregnancyWeek: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    walletBalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    savingsGoal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    goalPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    readiness: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Just Started'
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verifiedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false

      },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
  }, {
    sequelize,
    modelName: 'verifyPatientFund',
    tableName: 'patientFundVerifications'
  });
  return verifyPatientFund;
};