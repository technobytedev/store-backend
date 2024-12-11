'use strict';

const { Model, DataTypes } = require('sequelize');

// models/product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    productCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ProductCategories',
        key: 'id'
      }
    }
  }, {});
  Product.associate = (models) => {
    Product.belongsTo(models.ProductCategory, {
      foreignKey: 'productCategoryId',
      as: 'category'
    });
    Product.hasOne(models.ProductInventory, {
      foreignKey: 'productId',
      as: 'inventory'
    });
  };
  return Product;
};
