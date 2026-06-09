'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pregnancyTip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  pregnancyTip.init({
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
    message: {
      type: DataTypes.JSON,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'pregnancyTip',
  });
  return pregnancyTip;
};