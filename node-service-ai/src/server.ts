import  express,{type Request,type Response}  from 'express';
import app from "./app";
import { config } from '../config/config';
import modelInvoke from './graph/graph';



app.use(express.json())
app.get("/health",function(req:Request,res:Response){
    res.send({health:"Working......."})
})

app.post("/llm-diagram",async function(req:Request,res:Response){
        const payload = {userMessage:req.body.userMessage,diagram:req.body.diagram}
        const llmResponse = await modelInvoke(payload);
        res.status(200).send(llmResponse)
})


app.listen(config.port,()=>{
    console.log("server is working.....",config.port)
})