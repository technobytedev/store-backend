'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define('ProductCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  ProductCategory.associate = (models) => {
    ProductCategory.hasMany(models.Product, {
      foreignKey: 'productCategoryId',
      as: 'products'
    });
  };
  return ProductCategory;
};
