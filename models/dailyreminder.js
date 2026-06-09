'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dailyReminder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  dailyReminder.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    dayNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.JSON,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'dailyReminder',
  });
  return dailyReminder;
};