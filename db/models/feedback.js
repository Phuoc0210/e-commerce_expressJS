'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Feedback.belongsTo(models.Product, {
        foreignKey: 'product_id',
      });
      Feedback.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  Feedback.init(
    {
      product_id: DataTypes.UUID,
      user_id: DataTypes.UUID,
      star: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Feedback',
      tableName: 'feedbacks',
      underscored: true,
    }
  );
  return Feedback;
};
