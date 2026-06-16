'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class thirdTrimester extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  thirdTrimester.init({
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
    whatToExpect:{
      type: DataTypes.JSON,
      allowNull: false
    },
    nutritionGuidance:{
      type: DataTypes.JSON,
      allowNull: false
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
    modelName: 'thirdTrimester',
    tableName: 'thirdTrimesters'
  });
  return thirdTrimester;
};