import url from "url";
import bodyParser from "body-parser";
import {router} from "./config/router.mjs";
import express from "express";
import socket from "socket.io";
import http from "http";
import {chatObj} from "./controllers/chat/chat.mjs";
import {encrypt} from "./helper/encryptdecrypt.mjs";



const route={};

const app=express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });
  
const urlEncodedParser=bodyParser.urlencoded({limit:'5mb',extended:false});

let server=http.createServer(app);
const io=socket(server);

app.get("/",(request,response)=>{
    try
    {
        response.json({"status":"unsuccess","msg":"","error":"Access Denied"});
    }
    catch (error) 
    {
        response.json({"status":"unsuccess","msg":"","error":error});
    }
});
app.post("/",urlEncodedParser,(request,response)=>{
    try
    {
        response.json({"status":"unsuccess","msg":"","error":"Access Denied"});
    }
    catch (error) 
    {
        response.json({"status":"unsuccess","msg":"","error":error});
    }
});
for(let i=0;i<router.length;i++)
{
    route[router[i].model_name]=router[i].model;
    app.get("/"+router[i].model_name,urlEncodedParser,(request,response)=>{
        let pathname=url.parse(request.url).pathname.toString().split("/")[1];
        route[pathname](request,response);
    });
    app.post("/"+router[i].model_name,urlEncodedParser,(request,response)=>{
        let pathname=url.parse(request.url).pathname.toString().split("/")[1];
        route[pathname](request,response);
    });
}

io.on("connection",(socket)=>{
    socket.on('sendMessage', async(data,token) => {
        const result=await encrypt.verifyToken(token);
        if(result.status=="unsuccess")
        {
            io.emit("sendMessage",{result});
            return;
        }

        data=eval('('+data+')');
        const response=await chatObj.sendUserMessage(data,result.msg);
        if(response.status=="success")
        {
            const getresponse=await chatObj.getUserMessage(result.msg);
            io.emit("sendMessage",{getresponse});
        }
        else
        {
            io.emit("sendMessage",{response});
        }
      });
    // socket.on("getMessage",async(data,token)=>{
    //     const result=await encrypt.verifyToken(token);
    //     if(result.status=="unsuccess")
    //         socket.broadcast.emit(response);
    //     data=eval('('+data+')');
    //     const response=await chatObj.getUserMessage(result.msg);
    //     socket.broadcast.emit("getMessage",response);
    // });
});
server.listen(config.PORT,()=>{
        let host = server.address().address=="::"?"localhost":server.address().address;
        let port= server.address().port;
        console.log("Example app listening at http://%s:%s", host, port);
    });
    