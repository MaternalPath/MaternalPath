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
    edd: {
        type: DataTypes.STRING
      },
    amount: {
        type: DataTypes.INTEGER
     },
     otp: {
        type: DataTypes.STRING,
    },
    otpExpiresAt: {
        type: DataTypes.DATE,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        default: false
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

//   hospital.hasMany(mother, {
//   foreignKey: 'hospitalId',
//   as: 'mothers'
// })

// mother.belongsTo(hospital, {
//   foreignKey: 'hospitalId',
//   as: 'hospital'
// })
  
  
module.exports = Mother