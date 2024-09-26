import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import prisma from "./lib/db"
dotenv.config()
const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())

app.post("/api/identity", async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body

    const userExists = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if(!userExists) {
      const user = await prisma.user.create({
        data: {
          email,
        }
      })

      // No contact available for user
      const contact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          userId: user.id,
          linkPrecedence: 'primary'
        }
      })

      res.status(200).json({
        "contact": {
          "primaryContactId": contact.id,
          "emails": [contact.email],
          "phoneNumbers": [contact.phoneNumber],
          "secondaryContactIds": []
        }
      })
    }

    // if primary contact of the user already exists
    
  } catch (error) {
    console.log(error)
  }
})

app.listen(3000, () => console.log(`Server started on PORT:${PORT}`))
