import {SendBirdAction} from "../../config/sendBirdAction.mjs";
import {userdb} from "../../models/user_model.mjs";
import {encrypt} from "../../helper/encryptdecrypt.mjs";

let chatObj={};

chatObj.getUserList=async(data,tokenData)=>{
    try 
    {
        let userData={
            user_type:"admin",
            username:tokenData.username
        }
        if(data.name!="")
            userData.name=data.name;
        if(data.status!="")
            userData.status=data.status;
        if(data.email!="")
            userData.email=data.email;
        if(data.contactno!="")
            userData.contactno=data.contactno;
        if(data.location!="" && tokenData.user_type=="stall")
            userData.location=data.location;
        if(data.stallname!="" && tokenData.user_type=="stall")
            userData.stallname=data.stallname;
            
        let response = await userdb.getUserDetails(userData);
        return response;
    } catch (error) {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in fetching user list"};
    }
}
export let chat=(request,response)=>{
    try 
    {
        
        let data=request.body.data;
        data=eval('('+data+")");

        if(data.action=="getUsers")
        {
            const token=request.headers.authorization.replace("Bearer ","");
            const result=encrypt.verifyToken(token);
            result.then((result)=>{
                if(result.status=="unsuccess")
                {
                    response.json(result);
                    return;
                }
                let resp=chatObj.getUserList(data.data,result.msg);
                
                resp.then((result)=>{
                    response.json(result);
                });
                resp.catch((error)=>{
                    response.json({"status":"unsuccess","msg":"","error":error});
                });
            });
        }
        if(data.action=="userLogin")
        {
            let resp=userController.userLogin(data.data);

            resp.then((result)=>{
                response.json(result);
            });
            resp.catch((error)=>{
                response.json({"status":"unsuccess","msg":"","error":error});
            })
        }
        // response.json({"status":"success","msg":"User details accessed","error":''});
    } catch (error) {
        console.log(error);
        response.json({"status":"unsuccess","msg":"","error":error});
    }
}