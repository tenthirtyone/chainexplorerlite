const { DataTypes } = require("sequelize");

const Report = {
  reportId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  startBlock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  endBlock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
};

module.exports = Report;
