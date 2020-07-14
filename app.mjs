import express from "express";
import url from "url";
import bodyParser from "body-parser";
import {router} from "./config/router.mjs";

const route={};

const app=express();

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
// import SendBird from "sendbird";

// let sb=new SendBird({appId:"BD4FC23B-DA19-47EC-9FC3-D9E5AEF926F6"});

// sb.connect("dtanaji75", function(user, error) {
//     if (error) {
//         return;
//     }
//     console.log("User connected successfully.");
//     console.log(user);
// });