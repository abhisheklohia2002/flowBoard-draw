import  express,{type Request,type Response}  from 'express';
import app from "./app";



app.use(express.json())

app.get("/health",function(req:Request,res:Response){
    res.send({health:"Working......."})
})

app.listen(3000,()=>{
    console.log("server is working.....")
})