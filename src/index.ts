import express from "express"
import cors from "cors"
import dotenv from "dotenv"
const PORT = process.env.PORT || 3000

const app = express()


app.listen(3000, () => console.log(`Server started on PORT:${PORT}`))
