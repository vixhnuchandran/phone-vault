import express, { Request, Response } from "express"
import { PhoneVault, FlipkartPv, AmazonPv, GsmarenaPv } from "../models"
import sequelize from "../configs/db.config"
import { Op } from "sequelize"

const router = express.Router()

const dTables: { [key: string]: any } = {
  flipkart: FlipkartPv,
  amazon: AmazonPv,
  gsmarena: GsmarenaPv,
}

// Add Task
router.post("/add-data", async (req: Request, res: Response) => {
  const { url, data_name, data_value } = req.body

  if (url && data_name && data_value) {
    try {
      let phoneVaultId

      let [phoneVault] = await PhoneVault.findOrCreate({
        where: { url },
        defaults: { url },
      })

      phoneVaultId = phoneVault.dataValues.id

      const dTable = dTables[data_name]

      if (dTable) {
        const existingData = await dTable.findOne({
          where: {
            pv_id: phoneVaultId,
          },
        })

        if (existingData) {
          let dataExists = false

          existingData.data.some((obj: Record<string, any>) => {
            for (const versionObj of Object.values(obj)) {
              const versionData = { ...versionObj }
              delete versionData.date

              if (objectsAreEqual(versionData, data_value)) {
                const versionNumber = Object.keys(obj)[0]
                dataExists = true
                res.status(409).json({
                  message: "Data with the same values already exists",
                  version: versionNumber,
                })
                return true
              }
            }
            return false
          })

          if (dataExists) return
        }

        function objectsAreEqual(
          obj1: Record<string, any>,
          obj2: Record<string, any>
        ): boolean {
          const keys1 = Object.keys(obj1)
          const keys2 = Object.keys(obj2)

          if (keys1.length !== keys2.length) {
            return false
          }

          for (const key of keys1) {
            if (obj1[key] !== obj2[key]) {
              return false
            }
          }

          return true
        }

        const latestData = await dTable.findOne({
          where: { pv_id: phoneVaultId },
          order: [["id", "DESC"]],
        })

        let version
        let createdData

        if (!latestData) {
          version = "v1"
        } else {
          const versionNumber = latestData.data.length + 1
          version = `v${versionNumber}`
        }
        const newData = { [version]: data_value, date: Date.now() }

        if (!latestData) {
          createdData = await dTable.create({
            data: [newData],
            pv_id: phoneVaultId,
          })
        } else {
          createdData = await latestData.update({
            data: [...latestData.data, newData],
          })
        }

        return res.status(200).json({
          message: "Data inserted successfully",
          data: createdData,
        })
      } else {
        throw new Error(`Invalid data_name: ${data_name}`)
      }
    } catch (error) {
      console.error("Failed to add data:", error)
      return res
        .status(500)
        .json({ message: "Failed to add data", error: error.message })
    }
  } else {
    return res.status(400).json({ message: "Missing required parameters" })
  }
})

// Get Task
router.get("/get-data/:dataName", async (req: Request, res: Response) => {
  try {
    const dataName = req.params.dataName
    const url = req.query.url as string
    const version = req.query.version as string | undefined

    const dTable = dTables[dataName]

    if (!dTable) {
      throw new Error(`Invalid dataName: ${dataName}`)
    }
    const phoneVault = await PhoneVault.findOne({ where: { url } })
    if (!phoneVault) {
      throw new Error(`URL not found in PhoneVault: ${url}`)
    }
    const phoneVaultId = phoneVault.dataValues.id

    let dataToSend
    if (!version) {
      const data = await dTable.findOne({
        where: { pv_id: phoneVaultId },
        order: [["updatedAt", "DESC"]],
      })

      const dataWithoutDate = data.dataValues.data.map((item: any) => {
        const { date, ...rest } = item
        return rest
      })

      const latestData = dataWithoutDate.reduce((prev: any, current: any) => {
        const prevUpdatedAt = prev.updatedAt
        const currentUpdatedAt = current.updatedAt
        return prevUpdatedAt > currentUpdatedAt ? prev : current
      }, {})

      dataToSend = latestData
    } else {
      const versionKey = version.toLowerCase()
      const data = await dTable.findOne({
        where: {
          pv_id: phoneVaultId,
        },
      })

      if (!data) {
        throw new Error(
          `Data with version ${version} not found for the given URL.`
        )
      }

      const versionData = data.dataValues.data.find((item: any) => {
        const itemCopy = { ...item }
        delete item.date
        return itemCopy.hasOwnProperty(versionKey)
      })

      if (!versionData) {
        throw new Error(`Data with version ${version} not found.`)
      }

      dataToSend = versionData
    }

    res.status(200).json(dataToSend)
  } catch (error) {
    console.error("Failed to get data:", error)
    return res.status(500).json({ error: error.message })
  }
})

export default router
