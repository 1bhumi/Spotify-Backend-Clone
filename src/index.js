import app from "./app.js";
import dbConnect from "./database/database.connection.js";
import dotenv from "dotenv"

dotenv.config();

dbConnect()
.then(()=>{
    console.log("Database Connected!!!")
    
    app.on("error", (error) =>{
        console.log(error)
    })

    app.listen(process.env.PORT || 9000, ()=>{
        console.log(`Server is Working on ${process.env.PORT}`)
    })
    
})
.catch(error =>{
    console.log(`index.js :: dbConnect() :: ERROR: ${error?.message}`)
})
