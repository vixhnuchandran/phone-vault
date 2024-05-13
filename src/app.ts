import express from "express"
import { Application, Request, Response, NextFunction } from "express"
import cors from "cors"
import router from "./routes"

const app: Application = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: "50mb" }))

app.use((req: Request, res: Response, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`)
  next()
})

app.use("/api", router)

export default app
