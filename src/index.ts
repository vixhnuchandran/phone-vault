import app from "./app"
import dotenv from "dotenv"
import sequelize, { checkConnection } from "./configs/db.config"

dotenv.config()

const PORT = process.env.PORT || 8484

const startServer = async () => {
  try {
    await checkConnection()

    sequelize
      .sync({ alter: true })
      .then(() => {
        console.log("Database synchronized")

        app.listen(PORT, () => {
          console.log(`Server listening on port ${PORT}`)
        })
      })
      .catch(error => {
        console.error("Database synchronization failed:", error)
      })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
