
import {userdb} from "../../models/user_model.mjs";
import {SendBirdAction} from "../../config/sendbirdAction.mjs";
import {encrypt} from "../../helper/encryptdecrypt.mjs";

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
                "nickname":data.nickname,
                "user_type":"user",
            },
            "login":{
                "username":data.email,
                "password":data.password
            }
        }
        let response = await userdb.addUser(userData);
        
        if(response.status=="unsucces")
            return response;
        let sendBird=new SendBirdAction();
        await sendBird.connect(data.email,data.name);
        sendBird.disconnect();
        return response;
    }
    catch (error) 
    {
        let err=""+error;

        return {"status":"unsuccess","msg":"","error":err.replace("Error: Error:","").trim()};
    }
}
userController.userLogin=async (data)=>{
    try 
    {
        let response = await userdb.getLogin(data);
        if(response.status=="unsucces")
            return response;

        return response;
    }
    catch (error) 
    {
        let err=""+error;

        return {"status":"unsuccess","msg":"","error":err.replace("Error: Error:","").trim()};
    }
}
userController.userProfile=async(data,tokenData)=>{
    try 
    {
        let userData={
            user_type:tokenData.user_type,
            username:tokenData.username
        }
        
        data.name=data.name||"";
        data.status=data.status||"";
        data.email=data.email||"";
        data.contactno=data.contactno||"";

        if(data.name!="")
            userData.name=data.name;
        if(data.status!="")
            userData.status=data.status;
        if(data.email!="")
            userData.email=data.email;
        if(data.contactno!="")
            userData.contactno=data.contactno;
            
        let response = await userdb.getUserDetails(userData);

        return response;
    } catch (error) {
        console.log(error);
        return {"status":"unsuccess","msg":"","error":"Problem in fetching user list"};
    }
}
export let user=(request,response)=>{
    try 
    {
        let data=request.body.data;
        console.log(request.body.data);
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
        else if(data.action=="userLogin")
        {
            let resp=userController.userLogin(data.data);

            resp.then((result)=>{
                response.json(result);
            });
            resp.catch((error)=>{
                response.json({"status":"unsuccess","msg":"","error":error});
            })
        }
        else if(data.action=="userProfile")
        {
            if(!request.headers.hasOwnProperty("authorization"))
            {
                response.json({"status":"unsuccess","msg":"","error":"Api-key is missing"});
            }
            else if(request.headers.authorization=="")
            {
                response.json({"status":"unsuccess","msg":"","error":"Api-key cannot be empty."});
            }
            else
            {
                const token=request.headers.authorization.replace("Bearer ","");
                const result=encrypt.verifyToken(token);
                result.then((result)=>{
                    if(result.status=="unsuccess")
                    {
                        response.json(result);
                        return;
                    }
                    
                    let resp=userController.userProfile(data.data,result.msg);
                    
                    resp.then((result)=>{
                        response.json(result);
                    });
                    resp.catch((error)=>{
                        response.json({"status":"unsuccess","msg":"","error":error});
                    });
                });
            }
        }
        // response.json({"status":"success","msg":"User details accessed","error":''});
    } catch (error) {
        console.log(error);
        response.json({"status":"unsuccess","msg":"","error":error});
    }
}