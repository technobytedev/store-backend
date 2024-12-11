'use strict';

const { Model, DataTypes } = require('sequelize');

// models/productInventory.js
module.exports = (sequelize, DataTypes) => {
  const ProductInventory = sequelize.define('ProductInventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'id'
      }
    }
  }, {});
  ProductInventory.associate = (models) => {
    ProductInventory.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };
  return ProductInventory;
};
