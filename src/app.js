import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({origin: process.env.CORS_ORIGIN}))

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({limit:"30kb", extended: true}))
app.use(express.static("public"))

app.use(cookieParser())


import userRouter from "./routes/user.route.js"
import playlistRouter from "./routes/playlist.route.js"
import followRouter from "./routes/follower.route.js"
import songRouter from "./routes/song.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/follower", followRouter)
app.use("/api/v1/song", songRouter)

export default app;