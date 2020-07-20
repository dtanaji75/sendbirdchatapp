
import {userdb} from "../../models/user_model.mjs";
import {SendBirdAction} from "../../config/sendbirdAction.mjs";

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