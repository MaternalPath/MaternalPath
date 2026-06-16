'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class billsAndVerification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  billsAndVerification.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    hospitalId: {
      type: DataTypes.UUID,
      references: {
        model: "Hospitals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    motherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'mothers',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    billREf: {
      type: DataTypes.STRING,
      allowNull: false
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hospital: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    uploadDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      enum: ['approved','rejected','pendingReview', 'awaitingOTP'],
      defaultValue: 'awaitingOTP'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      enum: ['review','view'],
      defaultValue: 'review'
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
    modelName: 'billsAndVerification',
    tableName: 'billsAndVerifications'
  });
  return billsAndVerification;
};