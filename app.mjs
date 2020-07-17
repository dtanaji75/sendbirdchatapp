import url from "url";
import bodyParser from "body-parser";
import {router} from "./config/router.mjs";
import express from "express";

const route={};

const app=express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });
  
const urlEncodedParser=bodyParser.urlencoded({limit:'5mb',extended:false});




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
    app.get("/"+router[i].model_name,(request,response)=>{
        let pathname=url.parse(request.url).pathname.toString().split("/")[1];
        route[pathname](request,response);
    });
    app.post("/"+router[i].model_name,urlEncodedParser,(request,response)=>{
        let pathname=url.parse(request.url).pathname.toString().split("/")[1];
        route[pathname](request,response);
    });
}
let server=app.listen(8888,()=>{
        let host = server.address().address=="::"?"localhost":server.address().address;
        let port= server.address().port;
        console.log("Example app listening at http://%s:%s", host, port);
    });
    