'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Users extends Model {
    static associate(models) {
      // Define association with UserDetails
      this.hasOne(models.UserDetails, {
        foreignKey: 'userId',
        as: 'UserDetails', // Alias for the association
      });
    }
  }

  Users.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      password: {
        type: DataTypes.CHAR,
        allowNull: false,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
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
      modelName: 'Users', // Model name
      tableName: 'Users', // Explicit table name
      timestamps: true, // Automatically manages createdAt, updatedAt
      paranoid: true, // Enables soft delete functionality
    }
  );

  return Users;
};
