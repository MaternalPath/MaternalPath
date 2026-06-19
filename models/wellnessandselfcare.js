'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class wellnessAndSelfCare extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  wellnessAndSelfCare.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.JSON,
      allowNull: false
    },
    description: {
      type: DataTypes.JSON,
      allowNull: false
    },
    foodsToAvoid: {
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
    modelName: 'wellnessAndSelfCare',
  });
  return wellnessAndSelfCare;
};