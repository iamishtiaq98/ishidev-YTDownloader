const express = require("express") 
const cors = require("cors") 
const {json} = require("body-parser") 

const axios = require("axios") 
const path = require("path") 
const fs = require("fs") 
const WebSocket = 'ws'
const  http  = require('http') 
const YoutubeRouter = require("./src/Routes/YoutubeRoutes/YoutubeRoutes.js") 
const FacebookRouter = require( "./src/Routes/FacebookRoutes/FacebookRoutes.js")

const app = express()
app.use(cors())
app.use(json())
app.set('trust proxy', true);
app.use(json())
app.get("/",(req,res,next)=>{
    res.json({message:"start page"})
})


const server = http.createServer(app);


 server.listen(3001,()=>{
    console.log("server start in "+3001)
})



  app.use("/api/",YoutubeRouter)
  app.use("/api/facebook",FacebookRouter)
  