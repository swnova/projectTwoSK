const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Star extends Model {}

Star.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    kid_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'kid',
          key: 'id',
        },
      },
    task_category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'task_categories',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    createdAt: false, // don't add createdAt attribute
    updatedAt: true,
    freezeTableName: true,
    underscored: true,
    modelName: 'star',
  }
);


module.exports = Star;
