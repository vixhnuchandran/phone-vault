import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../configs/db.config"

const PhoneVault = sequelize.define("PhoneVault", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    unique: true,
  },
})

const FlipkartPv = sequelize.define("FlipkartPv", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: false,
    defaultValue: [],
  },

})

const AmazonPv = sequelize.define("AmazonPv", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: false,
    defaultValue: [],
  },
})

const GsmarenaPv = sequelize.define("GsmarenaPv", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  data: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: false,
    defaultValue: [],
  },
})

PhoneVault.hasMany(FlipkartPv, { foreignKey: "pv_id" })
PhoneVault.hasMany(AmazonPv, { foreignKey: "pv_id" })
PhoneVault.hasMany(GsmarenaPv, { foreignKey: "pv_id" })
FlipkartPv.belongsTo(PhoneVault, { foreignKey: "pv_id" })
AmazonPv.belongsTo(PhoneVault, { foreignKey: "pv_id" })
GsmarenaPv.belongsTo(PhoneVault, { foreignKey: "pv_id" })

export { PhoneVault, FlipkartPv, AmazonPv, GsmarenaPv }
