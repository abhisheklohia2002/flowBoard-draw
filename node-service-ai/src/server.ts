import  express,{type Request,type Response}  from 'express';
import app from "./app";
import { config } from '../config/config';



app.use(express.json())

app.get("/health",function(req:Request,res:Response){
    res.send({health:"Working......."})
})

app.listen(config.port,()=>{
    console.log("server is working.....",config.port)
})