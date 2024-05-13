import { configDotenv } from "dotenv"
import { Sequelize } from "sequelize"
configDotenv()
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

export const checkConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}
export default sequelize
