import {config} from "../config/config.mjs";
import {insertRecord} from "../config/database.mjs";

const user={};

user.addUser=async (data)=>{
    try 
    {   
        let response=await insertRecord();
        console.log(response);
        return {"status":"unsuccess","msg":"","error":"Problem in adding user."}; 
    }
    catch (error)
    {
        return {"status":"unsuccess","msg":"","error":"Problem in adding user."};
    }
}
user.addUser({"name":"tanaji"})
// console.log();
//export let userModel=user;