'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserDetails extends Model {
    static associate(models) {
      // Define association with User
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // Alias for the association
      });
    }
  }

  UserDetails.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserDetails', // Consistent naming convention
      tableName: 'UserDetails', // Explicit table name
      timestamps: true, // Ensures compatibility with paranoid
      paranoid: true, // Enables soft delete functionality
    }
  );

  return UserDetails;
};
