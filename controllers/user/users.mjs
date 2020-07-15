
import SendBird from "sendbird";
import {config} from "../../config/config.mjs";
import {log} from "../../config/log.mjs";
import {userdb} from "../../models/user_model.mjs";

const sb=new SendBird({appId:config.appId});

let userController={};

userController.registerUser=async (data)=>{
    try 
    {

        let userData={
            "user":{
                "name":data.name,
                "email":data.email,
                "contact":data.contact,
                "address":data.address,
                "user_type":"user",
            },
            "login":{
                "username":data.email,
                "password":data.password
            }
        }
        let response = await userdb.addUser(userData);
        console.log(response);
        if(response.status=="unsucces")
            return response;
        sb.connect(data.email,(user,error)=>{
          if(error)
            throw new Error(error);
            sb.updateCurrentUserInfo(data.name, "", function(response, error) {
            if (error) {
                throw new Error(error);
            }   
            });
        });
        sb.connect(data.email,(user,error)=>{
            if(error)
                throw new Error(error);
        sb.updateCurrentUserInfo(data.name, "", function(response, error) {
                    if (error) {
                        throw new Error(error);
                    }   
                });
        });
    }
    catch (error) 
    {
        let err=""+error;

        return {"status":"unsuccess","msg":"","error":err.replace("Error: Error:","").trim()};
    }
}
export let user=(request,response)=>{
    try 
    {
        let data=request.body.data;
        data=eval('('+data+")");

        if(data.action=="userRegister")
        {
            let resp=userController.registerUser(data.data);

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