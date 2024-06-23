// * built backend

//` Load environment variables from .env file

 require("dotenv").config()

const express = require("express")
const app = express()

//= db connection

const dbConnection = require("./db/dbConfig")
const cors = require ("cors")
// = authentication middleware

const authMiddleware = require("./middleware/authMiddleware")


// `  import the file that contain users request

const userRouter = require("./routes/userRoute")

// ` import the file that contain question request

const questionRouter = require("./routes/questionRoute")

// ` import the file that contain answer request

const answerRouter = require("./routes/answerRoute")

// `Use the PORT environment variable if available, otherwise use 1234
const port = process.env.PORT || 1234;


app.use(cors())

// ` json middleware to extract json data
app.use(express.json())

console.log("Setting up routes...");


// ` middleware to access the user request

app.use("/api/users", userRouter)


// ` middleware to access the question request, authMiddleware to check authorization 

app.use("/api/questions",authMiddleware ,questionRouter )


// ` middleware to access the answer request

app.use("/api/answers",authMiddleware ,answerRouter )
// app.use("/api/answers" ,answerRouter )

// : use async await to execute the db and listen the app

async function start(){
    try {
   const result =  await dbConnection.execute("select 'test' ")
  //  console.log(result);
   await app.listen(port)
   console.log(`server is running on http://localhost:${port}`)
   
} catch (error) {
    console.log(error.message);
}
}

start()




// ` listen
// app.listen(port, (err)=>{
//     if (err){
//         console.log(err.message)
//     } else{
//         console.log(`server is running on http://localhost:${port}`)
//     }
// })
