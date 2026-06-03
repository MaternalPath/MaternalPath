const {Sequelize, DataTypes, Model} = require('sequelize');
const sequelize = require('../database/db');
//const hospital = require('./hospital')

class Mother extends Model {}

  Mother.init({
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
    hospitalId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: "hospitals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
     },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
    email: {
        type: DataTypes.STRING,
        allowNull: false

      },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
    password: {
        type: DataTypes.STRING,
        allowNull: false
      },
    dateOfBirth: {
        type: DataTypes.STRING,
      },
    estimatedDueDate: {
        type: DataTypes.STRING
      },
    trimester: {
        type: DataTypes.STRING
      },
    bloodType: {
        type: DataTypes.STRING
      },
    existingHealthConditions: {
        type: DataTypes.STRING
      },
    allergies: {
        type: DataTypes.STRING
      },
    amount: {
        type: DataTypes.INTEGER
     },
    currentPregnancyWeek: {
        type: DataTypes.INTEGER
     },
    emergencyContact: {
        type: DataTypes.STRING
     },
    selectedHospital: {
        type: DataTypes.STRING
     },
    hospitalAddress: {
        type: DataTypes.STRING
     },
    hospitalContact: {
        type: DataTypes.STRING
     },
    estimatedDeliveryCost: {
        type: DataTypes.STRING
     },
    savingsGoalAmount: {
        type: DataTypes.STRING
     },
    address: {
        type: DataTypes.STRING
     },
    currentBalance: {
        type: DataTypes.STRING
     },
    weeklyContribution: {
        type: DataTypes.STRING
     },
    linkedPaymentMethod: {
        type: DataTypes.STRING
     },
     otp: {
        type: DataTypes.STRING
    },
    otpExpiresAt: {
        type: DataTypes.DATE,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isUpdated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    modelName: 'mother',
    tableName: 'mothers'
  });

  hospital.hasMany(mother, {
  foreignKey: 'hospitalId',
  as: 'mothers'
})

mother.belongsTo(hospital, {
  foreignKey: 'hospitalId',
  as: 'hospital'
})
  
  
module.exports = Mother